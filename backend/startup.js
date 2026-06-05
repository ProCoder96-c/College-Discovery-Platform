const { db, initDB } = require('./db');
const runSeedCSV = require('./seed_csv');

// Initialize database schema
initDB();

try {
  const row = db.prepare('SELECT COUNT(*) as count FROM colleges').get();
  if (row.count === 0) {
    console.log('Empty DB detected, seeding from CSV...');
    runSeedCSV();
  } else {
    console.log(`Database exists. Loaded with ${row.count} colleges.`);
  }
} catch (err) {
  console.error('Startup check failed. Initializing seed...', err);
  runSeedCSV();
}
