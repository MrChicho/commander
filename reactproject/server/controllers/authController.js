const bcrypt = require('bcryptjs');
const db = require('../models/db');

exports.register = async (req, res) => {
  const { email, username, password } = req.body;
  if (!email || !username || !password) return res.status(400).json({ error: 'All fields required' });
  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(409).json({ error: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)', [email, username, hash]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'All fields required' });
  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    req.session.userId = user.id;
    req.session.email = user.email;
    res.json({ success: true, email: user.email });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
};

exports.sessionCheck = (req, res) => {
  if (req.session.userId && req.session.email) {
    res.json({ logged_in: true, email: req.session.email });
  } else {
    res.json({ logged_in: false });
  }
};
