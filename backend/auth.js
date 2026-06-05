const crypto = require('node:crypto');
const { db } = require('./db');

const PASSWORD_SALT = 'platform-salt-string-123';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function hashPassword(password) {
  return crypto.createHmac('sha256', PASSWORD_SALT).update(password).digest('hex');
}

function createSession(userId) {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
  
  const stmt = db.prepare(`
    INSERT INTO sessions (token, user_id, expires_at)
    VALUES (?, ?, ?)
  `);
  stmt.run(token, userId, expiresAt);
  return token;
}

function deleteSession(token) {
  const stmt = db.prepare("DELETE FROM sessions WHERE token = ?");
  stmt.run(token);
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. No session token provided.' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const stmt = db.prepare(`
      SELECT sessions.token, sessions.user_id, sessions.expires_at, users.email, users.name
      FROM sessions
      JOIN users ON sessions.user_id = users.id
      WHERE sessions.token = ?
    `);
    const session = stmt.get(token);

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized. Invalid session token.' });
    }

    const expiresAt = new Date(session.expires_at);
    if (expiresAt < new Date()) {
      // Clean up expired session
      deleteSession(token);
      return res.status(401).json({ error: 'Unauthorized. Session has expired.' });
    }

    // Populate user info on request object
    req.user = {
      id: session.user_id,
      email: session.email,
      name: session.name,
      token: session.token
    };

    next();
  } catch (err) {
    console.error('Auth check error:', err);
    res.status(500).json({ error: 'Internal server error during authorization.' });
  }
}

module.exports = {
  hashPassword,
  createSession,
  deleteSession,
  authMiddleware
};
