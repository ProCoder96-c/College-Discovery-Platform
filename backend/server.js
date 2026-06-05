const express = require('express');
const path = require('path');
const cors = require('cors');
const { initDB } = require('./db');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database on startup
initDB();

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Serve static frontend assets in production
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Wildcard routing to React SPA index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});


// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error.' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Backend REST API server running at http://localhost:${PORT}`);
});
