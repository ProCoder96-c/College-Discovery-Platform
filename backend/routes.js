const express = require('express');
const crypto = require('node:crypto');
const { db } = require('./db');
const { hashPassword, createSession, deleteSession, authMiddleware } = require('./auth');

const router = express.Router();

// ==========================================
// 1. College Listing + Search & Filters
// ==========================================
router.get('/colleges', (req, res) => {
  try {
    const q = req.query.q || '';
    const state = req.query.state || '';
    const maxFees = req.query.maxFees ? parseInt(req.query.maxFees) : null;
    const minRating = req.query.minRating ? parseFloat(req.query.minRating) : null;
    const course = req.query.course || '';
    const sortBy = req.query.sortBy || 'name'; // name, fees, rating, placement
    const sortOrder = req.query.sortOrder === 'desc' ? 'DESC' : 'ASC';
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const offset = (page - 1) * limit;

    let sqlWhere = ' WHERE 1=1';
    let params = [];

    // Filters
    if (q) {
      sqlWhere += ' AND (colleges.name LIKE ? OR colleges.location LIKE ? OR colleges.state LIKE ?)';
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    if (state) {
      sqlWhere += ' AND colleges.state = ?';
      params.push(state);
    }

    if (maxFees) {
      sqlWhere += ' AND colleges.fees <= ?';
      params.push(maxFees);
    }

    if (minRating) {
      sqlWhere += ' AND colleges.rating >= ?';
      params.push(minRating);
    }

    if (course) {
      sqlWhere += ' AND colleges.id IN (SELECT college_id FROM courses WHERE name LIKE ?)';
      params.push(`%${course}%`);
    }

    // Get total count for pagination
    const countSql = `SELECT COUNT(*) as count FROM colleges ${sqlWhere}`;
    const totalCountResult = db.prepare(countSql).get(...params);
    const totalCount = totalCountResult ? totalCountResult.count : 0;

    // Sorting column mapping
    let orderColumn = 'name';
    if (sortBy === 'fees') orderColumn = 'fees';
    else if (sortBy === 'rating') orderColumn = 'rating';
    else if (sortBy === 'placement') orderColumn = 'average_placement';

    const selectSql = `
      SELECT id, name, location, state, fees, rating, average_placement, highest_placement, logo_url
      FROM colleges
      ${sqlWhere}
      ORDER BY ${orderColumn} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    // Append limit and offset to query parameters
    const queryParams = [...params, limit, offset];
    const colleges = db.prepare(selectSql).all(...queryParams);

    res.json({
      colleges,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (err) {
    console.error('Fetch colleges error:', err);
    res.status(500).json({ error: 'Failed to fetch colleges.' });
  }
});

// ==========================================
// 2. College Detail Page
// ==========================================
router.get('/colleges/:id', (req, res) => {
  try {
    const { id } = req.params;

    const college = db.prepare("SELECT * FROM colleges WHERE id = ?").get(id);
    if (!college) {
      return res.status(404).json({ error: 'College not found.' });
    }

    const courses = db.prepare("SELECT name, duration, fees_per_year FROM courses WHERE college_id = ?").all(id);
    const reviews = db.prepare("SELECT id, username, rating, comment, created_at FROM reviews WHERE college_id = ? ORDER BY created_at DESC").all(id);

    res.json({
      ...college,
      courses,
      reviews
    });
  } catch (err) {
    console.error('Fetch college details error:', err);
    res.status(500).json({ error: 'Failed to fetch college details.' });
  }
});

// ==========================================
// 3. Post a Review (Auth Required)
// ==========================================
router.post('/colleges/:id/reviews', authMiddleware, (req, res) => {
  try {
    const collegeId = req.params.id;
    const { rating, comment } = req.body;
    
    if (!rating || !comment) {
      return res.status(400).json({ error: 'Rating and comment are required.' });
    }

    const numericRating = parseFloat(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ error: 'Rating must be a number between 1 and 5.' });
    }

    // Verify college exists
    const college = db.prepare("SELECT id FROM colleges WHERE id = ?").get(collegeId);
    if (!college) {
      return res.status(404).json({ error: 'College not found.' });
    }

    // Insert review
    const reviewId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO reviews (id, college_id, user_id, username, rating, comment)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(reviewId, collegeId, req.user.id, req.user.name, numericRating, comment);

    // Update College Rating Average
    const stats = db.prepare("SELECT AVG(rating) as avgRating FROM reviews WHERE college_id = ?").get(collegeId);
    if (stats && stats.avgRating) {
      const newRating = Math.round(stats.avgRating * 10) / 10; // Round to 1 decimal place
      db.prepare("UPDATE colleges SET rating = ? WHERE id = ?").run(newRating, collegeId);
    }

    res.status(201).json({ message: 'Review added successfully.', rating: numericRating, comment });
  } catch (err) {
    console.error('Add review error:', err);
    res.status(500).json({ error: 'Failed to submit review.' });
  }
});

// ==========================================
// 4. Compare Colleges
// ==========================================
router.get('/compare', (req, res) => {
  try {
    const idsString = req.query.ids || '';
    if (!idsString) {
      return res.json([]);
    }

    const ids = idsString.split(',').filter(id => id.trim().length > 0);
    if (ids.length === 0) {
      return res.json([]);
    }

    // Dynamically build sql to fetch selected ids
    const placeholders = ids.map(() => '?').join(',');
    const sql = `SELECT * FROM colleges WHERE id IN (${placeholders})`;
    
    const colleges = db.prepare(sql).all(...ids);

    // Fetch courses and cutoffs for each compared college
    const comparisonData = colleges.map(col => {
      const courses = db.prepare("SELECT name, duration, fees_per_year FROM courses WHERE college_id = ?").all(col.id);
      const cutoffs = db.prepare("SELECT exam, branch, category, closing_rank FROM cutoffs WHERE college_id = ?").all(col.id);
      return {
        ...col,
        courses,
        cutoffs
      };
    });

    res.json(comparisonData);
  } catch (err) {
    console.error('Comparison error:', err);
    res.status(500).json({ error: 'Failed to compile comparison data.' });
  }
});

// ==========================================
// 5. Predictor Tool
// ==========================================
router.post('/predict', (req, res) => {
  try {
    const { exam, rank, category, branch } = req.body;

    if (!exam || !rank || !category) {
      return res.status(400).json({ error: 'Exam type, rank, and category are required fields.' });
    }

    const userRank = parseInt(rank);
    if (isNaN(userRank) || userRank <= 0) {
      return res.status(400).json({ error: 'Rank must be a valid positive integer.' });
    }

    let sql = `
      SELECT 
        cutoffs.branch, cutoffs.closing_rank, cutoffs.exam, cutoffs.category,
        colleges.id as college_id, colleges.name as college_name, colleges.location, 
        colleges.state, colleges.fees, colleges.rating, colleges.average_placement, colleges.logo_url
      FROM cutoffs
      JOIN colleges ON cutoffs.college_id = colleges.id
      WHERE cutoffs.exam = ? AND cutoffs.category = ?
    `;
    let params = [exam, category];

    if (branch) {
      sql += ' AND cutoffs.branch LIKE ?';
      params.push(`%${branch}%`);
    }

    const allMatches = db.prepare(sql).all(...params);

    // Process and score likelihood of admission
    // High chance: userRank <= closing_rank * 0.85 (rank is safely below/better than the cutoff)
    // Medium chance: userRank between closing_rank * 0.85 and closing_rank
    // Low / Stretch chance: userRank is slightly worse than closing_rank, up to closing_rank * 1.15
    const results = allMatches
      .map(match => {
        let likelihood = 'Low';
        let color = '#ef4444'; // Red
        
        if (userRank <= match.closing_rank * 0.85) {
          likelihood = 'High';
          color = '#10b981'; // Green
        } else if (userRank <= match.closing_rank) {
          likelihood = 'Medium';
          color = '#f59e0b'; // Amber
        } else if (userRank <= match.closing_rank * 1.15) {
          likelihood = 'Stretch';
          color = '#3b82f6'; // Blue
        } else {
          return null; // Too far off
        }

        return {
          ...match,
          likelihood,
          likelihoodColor: color
        };
      })
      .filter(item => item !== null)
      .sort((a, b) => a.closing_rank - b.closing_rank); // Sort by hardest to get into (lowest closing rank first)

    res.json(results);
  } catch (err) {
    console.error('Predictor error:', err);
    res.status(500).json({ error: 'Predictor tool execution failed.' });
  }
});

// ==========================================
// 6. Authentication Routes
// ==========================================
router.post('/auth/register', (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields (email, password, name) are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    // Check if user exists
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const userId = crypto.randomUUID();
    const passwordHash = hashPassword(password);

    db.prepare(`
      INSERT INTO users (id, email, password_hash, name)
      VALUES (?, ?, ?, ?)
    `).run(userId, email, passwordHash, name);

    const token = createSession(userId);

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: { id: userId, email, name }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

router.post('/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const passHash = hashPassword(password);
    if (user.password_hash !== passHash) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = createSession(user.id);

    res.json({
      message: 'Login successful.',
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed.' });
  }
});

router.post('/auth/logout', authMiddleware, (req, res) => {
  try {
    deleteSession(req.user.token);
    res.json({ message: 'Logged out successfully.' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Logout failed.' });
  }
});

router.get('/auth/me', authMiddleware, (req, res) => {
  res.json({ user: { id: req.user.id, email: req.user.email, name: req.user.name } });
});

// ==========================================
// 7. Saved Items Routes (Bookmarks)
// ==========================================
router.get('/saved', authMiddleware, (req, res) => {
  try {
    const sql = `
      SELECT colleges.id, colleges.name, colleges.location, colleges.state, colleges.fees, colleges.rating, colleges.average_placement, colleges.logo_url
      FROM saved_colleges
      JOIN colleges ON saved_colleges.college_id = colleges.id
      WHERE saved_colleges.user_id = ?
    `;
    const savedColleges = db.prepare(sql).all(req.user.id);
    res.json(savedColleges);
  } catch (err) {
    console.error('Fetch saved colleges error:', err);
    res.status(500).json({ error: 'Failed to fetch saved colleges.' });
  }
});

router.post('/saved/:id', authMiddleware, (req, res) => {
  try {
    const collegeId = req.params.id;

    // Verify college exists
    const college = db.prepare("SELECT id FROM colleges WHERE id = ?").get(collegeId);
    if (!college) {
      return res.status(404).json({ error: 'College not found.' });
    }

    // Insert ignore/insert or check first
    const existing = db.prepare("SELECT * FROM saved_colleges WHERE user_id = ? AND college_id = ?").get(req.user.id, collegeId);
    if (!existing) {
      db.prepare("INSERT INTO saved_colleges (user_id, college_id) VALUES (?, ?)").run(req.user.id, collegeId);
    }

    res.json({ message: 'College saved successfully.', collegeId });
  } catch (err) {
    console.error('Save college error:', err);
    res.status(500).json({ error: 'Failed to save college.' });
  }
});

router.delete('/saved/:id', authMiddleware, (req, res) => {
  try {
    const collegeId = req.params.id;
    db.prepare("DELETE FROM saved_colleges WHERE user_id = ? AND college_id = ?").run(req.user.id, collegeId);
    res.json({ message: 'College removed from bookmarks.', collegeId });
  } catch (err) {
    console.error('Remove saved college error:', err);
    res.status(500).json({ error: 'Failed to remove saved college.' });
  }
});

module.exports = router;
