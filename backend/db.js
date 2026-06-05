const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'database.sqlite');

// Ensure the parent directory exists (crucial for custom volume mounts)
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new DatabaseSync(dbPath);

// Initialize tables
function initDB() {
  // Create Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create Sessions Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Create Colleges Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS colleges (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      state TEXT NOT NULL,
      fees INTEGER NOT NULL,
      rating REAL NOT NULL,
      overview TEXT NOT NULL,
      average_placement REAL NOT NULL,
      highest_placement REAL NOT NULL,
      logo_url TEXT,
      banner_url TEXT
    );
  `);

  // Create Courses Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      college_id TEXT NOT NULL,
      name TEXT NOT NULL,
      duration TEXT NOT NULL,
      fees_per_year INTEGER NOT NULL,
      FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE
    );
  `);

  // Create Reviews Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      college_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      username TEXT NOT NULL,
      rating REAL NOT NULL,
      comment TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE
    );
  `);

  // Create Saved Colleges (bookmarks) Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS saved_colleges (
      user_id TEXT NOT NULL,
      college_id TEXT NOT NULL,
      PRIMARY KEY (user_id, college_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE
    );
  `);

  // Create Cutoffs Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS cutoffs (
      id TEXT PRIMARY KEY,
      college_id TEXT NOT NULL,
      exam TEXT NOT NULL,
      branch TEXT NOT NULL,
      category TEXT NOT NULL,
      closing_rank INTEGER NOT NULL,
      FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE
    );
  `);

  console.log('SQLite database initialized successfully at:', dbPath);
}

module.exports = {
  db,
  initDB
};
