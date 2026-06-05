const fs = require('fs');
const path = require('path');
const crypto = require('node:crypto');
const { db, initDB } = require('./db');

const CSV_PATH = path.join(__dirname, '..', 'database.csv');

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function runSeedCSV() {
  console.log("Initializing database tables...");
  initDB();

  // Clear existing data to allow fresh seeds
  db.exec("DELETE FROM cutoffs;");
  db.exec("DELETE FROM reviews;");
  db.exec("DELETE FROM courses;");
  db.exec("DELETE FROM saved_colleges;");
  db.exec("DELETE FROM sessions;");
  db.exec("DELETE FROM users;");
  db.exec("DELETE FROM colleges;");

  console.log("Cleared existing database records.");

  if (!fs.existsSync(CSV_PATH)) {
    console.error(`Error: database.csv not found at ${CSV_PATH}`);
    return;
  }

  console.log(`Reading CSV data from ${CSV_PATH}...`);
  const content = fs.readFileSync(CSV_PATH, 'utf-8');
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  
  // Shift header line
  const headerLine = lines.shift();
  console.log(`Parsing ${lines.length} colleges...`);

  // Prepare insert statements
  const insertCollege = db.prepare(`
    INSERT INTO colleges (id, name, location, state, fees, rating, overview, average_placement, highest_placement, logo_url, banner_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertCourse = db.prepare(`
    INSERT INTO courses (id, college_id, name, duration, fees_per_year)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertCutoff = db.prepare(`
    INSERT INTO cutoffs (id, college_id, exam, branch, category, closing_rank)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertReview = db.prepare(`
    INSERT INTO reviews (id, college_id, user_id, username, rating, comment)
    VALUES (?, ?, 'seed-user', ?, ?, ?)
  `);

  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password_hash, name)
    VALUES ('test-user-id', 'test@college.com', ?, 'Test Student')
  `);

  // Seed test user
  const salt = 'platform-salt-string-123';
  const passHash = crypto.createHmac('sha256', salt).update('password123').digest('hex');
  insertUser.run(passHash);
  console.log("Seeded default test account: test@college.com (password: password123)");

  // Start Transaction for high-speed seeding
  db.exec("BEGIN TRANSACTION;");

  let collegeCount = 0;
  let courseCount = 0;
  let cutoffCount = 0;
  let reviewCount = 0;

  // Unsplash templates
  const bannerImages = [
    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1498243691581-b145c3f54a5c?w=800&auto=format&fit=crop&q=80"
  ];

  const logoImages = [
    "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=120&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=120&auto=format&fit=crop&q=60"
  ];

  const reviewTemplates = [
    "Great infrastructure, very helpful professors, and supportive environment.",
    "Academic pressure is high, but the placement opportunities are excellent.",
    "Decent college life with active clubs. Hostels are clean.",
    "Outstanding campus location and industry exposure."
  ];

  const reviewUsernames = ["Aman Shah", "Neha Rao", "Vivek Sen", "Priya K."];

  for (let i = 0; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 6) continue;

    const rawUnivName = cols[1];
    const rawCollegeName = cols[2];
    const collegeType = cols[3];
    const stateName = cols[4];
    const districtName = cols[5];

    // Clean Names by stripping (Id: C-XXXXX)
    const collegeName = rawCollegeName.replace(/\s*\(Id:\s*[A-Z0-9-]+\)\s*/i, '').trim();
    const univName = rawUnivName.replace(/\s*\(Id:\s*[A-Z0-9-]+\)\s*/i, '').trim();

    // Extract unique ID or fallback to sequence
    const idMatch = rawCollegeName.match(/\(Id:\s*([A-Z0-9-]+)\)/i);
    const collegeId = idMatch ? idMatch[1].toLowerCase() : `clg-${i + 1}`;

    // Helper character code extractors
    const charCode0 = collegeId.charCodeAt(0) || 100;
    const charCode1 = collegeId.charCodeAt(1) || 100;

    // Categorize college based on name keywords
    let type = 'general'; // general, engineering, medical, law, management, education
    const lowerName = collegeName.toLowerCase();
    
    if (lowerName.includes('engineering') || lowerName.includes('technology') || lowerName.includes('technical') || lowerName.includes('polytechnic') || lowerName.includes('science')) {
      type = 'engineering';
    } else if (lowerName.includes('medical') || lowerName.includes('dental') || lowerName.includes('nursing') || lowerName.includes('pharmacy') || lowerName.includes('health') || lowerName.includes('ayurved')) {
      type = 'medical';
    } else if (lowerName.includes('law') || lowerName.includes('legal') || lowerName.includes('juris')) {
      type = 'law';
    } else if (lowerName.includes('management') || lowerName.includes('business') || lowerName.includes('commerce') || lowerName.includes('mba')) {
      type = 'management';
    } else if (lowerName.includes('education') || lowerName.includes('training') || lowerName.includes('b.ed') || lowerName.includes('teacher')) {
      type = 'education';
    }

    // Determine courses and pricing based on category
    let courses = [];
    let avgPlacement = 0;
    let highestPlacement = 0;

    if (type === 'engineering') {
      courses = [
        { name: "B.Tech Computer Science & Engineering", duration: "4 Years", fees_per_year: 120000 + (charCode0 % 15) * 10000 },
        { name: "B.Tech Electrical Engineering", duration: "4 Years", fees_per_year: 110000 + (charCode0 % 15) * 8000 },
        { name: "B.Tech Mechanical Engineering", duration: "4 Years", fees_per_year: 100000 + (charCode0 % 15) * 7000 }
      ];
      avgPlacement = 4.5 + (charCode0 % 10) * 1.2; // 4.5 - 16.5 LPA
      highestPlacement = avgPlacement * (1.8 + (charCode1 % 5) * 0.4); // up to 50+ LPA
    } else if (type === 'medical') {
      courses = [
        { name: "Bachelor of Medicine & Bachelor of Surgery (MBBS)", duration: "5.5 Years", fees_per_year: 45000 + (charCode0 % 20) * 8000 },
        { name: "B.Sc Nursing", duration: "4 Years", fees_per_year: 30000 + (charCode0 % 10) * 3000 }
      ];
      avgPlacement = 6.0 + (charCode0 % 8) * 1.5; // 6.0 - 18.0 LPA
      highestPlacement = avgPlacement * 1.8;
    } else if (type === 'management') {
      courses = [
        { name: "Master of Business Administration (MBA)", duration: "2 Years", fees_per_year: 150000 + (charCode0 % 15) * 15000 },
        { name: "Bachelor of Business Administration (BBA)", duration: "3 Years", fees_per_year: 80000 + (charCode0 % 10) * 5000 }
      ];
      avgPlacement = 4.0 + (charCode0 % 10) * 1.4; // 4.0 - 18.0 LPA
      highestPlacement = avgPlacement * 2.0;
    } else if (type === 'law') {
      courses = [
        { name: "BA LLB (Integrated)", duration: "5 Years", fees_per_year: 75000 + (charCode0 % 10) * 6000 },
        { name: "LLB", duration: "3 Years", fees_per_year: 50000 + (charCode0 % 10) * 4000 }
      ];
      avgPlacement = 3.5 + (charCode0 % 6) * 1.2; // 3.5 - 10.7 LPA
      highestPlacement = avgPlacement * 1.8;
    } else if (type === 'education') {
      courses = [
        { name: "Bachelor of Education (B.Ed)", duration: "2 Years", fees_per_year: 35000 + (charCode0 % 5) * 5000 }
      ];
      avgPlacement = 2.5 + (charCode0 % 5) * 0.8; // 2.5 - 6.5 LPA
      highestPlacement = avgPlacement * 1.5;
    } else {
      courses = [
        { name: "Bachelor of Science (B.Sc)", duration: "3 Years", fees_per_year: 20000 + (charCode0 % 10) * 2000 },
        { name: "Bachelor of Arts (B.A)", duration: "3 Years", fees_per_year: 12000 + (charCode0 % 10) * 1500 }
      ];
      avgPlacement = 2.5 + (charCode0 % 5) * 0.8;
      highestPlacement = avgPlacement * 1.5;
    }

    // Calculate average fees
    const totalFees = courses.reduce((sum, c) => sum + c.fees_per_year, 0);
    const avgFees = courses.length > 0 ? Math.round(totalFees / courses.length) : 50000;
    const rating = Math.round((3.8 + (charCode0 % 12) * 0.1) * 10) / 10; // 3.8 - 4.9

    const overview = `${collegeName} is a recognized ${collegeType.toLowerCase()} located in the district of ${districtName}, ${stateName}. The institution is affiliated with ${univName} and aims to provide high quality education.`;

    const bannerUrl = bannerImages[i % bannerImages.length];
    const logoUrl = logoImages[i % logoImages.length];

    // Insert College
    insertCollege.run(
      collegeId,
      collegeName,
      districtName,
      stateName,
      avgFees,
      rating,
      overview,
      Math.round(avgPlacement * 100) / 100,
      Math.round(highestPlacement * 100) / 100,
      logoUrl,
      bannerUrl
    );
    collegeCount++;

    // Insert Courses
    for (const c of courses) {
      const courseId = crypto.randomUUID();
      insertCourse.run(courseId, collegeId, c.name, c.duration, c.fees_per_year);
      courseCount++;
    }

    // Seed Cutoffs for Engineering (JEE Main) or Medical (NEET)
    if (type === 'engineering') {
      const categories = ['General', 'OBC', 'SC', 'ST'];
      categories.forEach((cat, idx) => {
        const baseRank = 1200 + (charCode0 % 30) * 800; // 1200 - 25200 base
        const closingRank = baseRank * (idx + 1) + (charCode1 % 500);
        const cutoffId = crypto.randomUUID();
        
        insertCutoff.run(
          cutoffId,
          collegeId,
          "JEE Main",
          "Computer Science & Engineering",
          cat,
          Math.round(closingRank)
        );
        cutoffCount++;
      });
    } else if (type === 'medical') {
      const categories = ['General', 'OBC', 'SC', 'ST'];
      categories.forEach((cat, idx) => {
        const baseRank = 500 + (charCode0 % 20) * 600; // 500 - 12500 base
        const closingRank = baseRank * (idx + 1.2) + (charCode1 % 200);
        const cutoffId = crypto.randomUUID();
        
        insertCutoff.run(
          cutoffId,
          collegeId,
          "NEET",
          "MBBS",
          cat,
          Math.round(closingRank)
        );
        cutoffCount++;
      });
    }

    // Seed a couple of reviews
    if (i % 7 === 0) { // Seed reviews for every 7th college
      const revIdx = charCode0 % reviewTemplates.length;
      const userIdx = charCode1 % reviewUsernames.length;
      const reviewId = crypto.randomUUID();
      
      insertReview.run(
        reviewId,
        collegeId,
        reviewUsernames[userIdx],
        rating,
        reviewTemplates[revIdx]
      );
      reviewCount++;
    }

    // Print progress indicator
    if (collegeCount % 5000 === 0) {
      console.log(`Inserted ${collegeCount} colleges...`);
    }
  }

  // Commit Transaction
  db.exec("COMMIT;");

  console.log(`=========================================`);
  console.log(`Seeding complete!`);
  console.log(`Colleges inserted: ${collegeCount}`);
  console.log(`Courses inserted:  ${courseCount}`);
  console.log(`Cutoffs seeded:    ${cutoffCount}`);
  console.log(`Reviews seeded:    ${reviewCount}`);
  console.log(`=========================================`);
}

if (require.main === module) {
  runSeedCSV();
}

module.exports = runSeedCSV;
