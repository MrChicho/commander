const db = require('../models/db');

exports.getDecks = async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const [decks] = await db.query('SELECT * FROM decks WHERE user_id = ?', [req.session.userId]);
    res.json({ success: true, decks });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createDeck = async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  try {
    await db.query('INSERT INTO decks (user_id, name, description) VALUES (?, ?, ?)', [req.session.userId, name, description || '']);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateDeck = async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
  const { name, description } = req.body;
  try {
    await db.query('UPDATE decks SET name = ?, description = ? WHERE id = ? AND user_id = ?', [name, description, req.params.id, req.session.userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteDeck = async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
  try {
    await db.query('DELETE FROM decks WHERE id = ? AND user_id = ?', [req.params.id, req.session.userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
