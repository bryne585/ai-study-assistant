const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Document = require('../models/Document');

// Middleware to verify token
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get all documents for logged in user
router.get('/', auth, async (req, res) => {
  try {
    const docs = await Document.find({ userId: req.userId })
      .select('filename uploadedAt _id')
      .sort({ uploadedAt: -1 });
    res.json({ documents: docs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;