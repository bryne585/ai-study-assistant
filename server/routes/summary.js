const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const Document = require('../models/Document');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/:documentId', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.documentId);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a helpful study assistant. Summarize the following text clearly and concisely.' },
        { role: 'user', content: doc.text.slice(0, 4000) }
      ]
    });

    const summary = completion.choices[0].message.content;
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;