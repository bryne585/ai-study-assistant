const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const Document = require('../models/Document');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files allowed'), false);
  }
});

router.post('/', upload.single('pdf'), async (req, res) => {
  try {
    const dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdfParse(dataBuffer);

    // Get userId from token if provided
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    }

    const doc = new Document({
      userId,
      filename: req.file.originalname,
      text: data.text
    });
    await doc.save();

    res.json({ message: 'PDF uploaded and saved!', documentId: doc._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;