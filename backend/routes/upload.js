import express from 'express';
import multer from 'multer';
import path from 'path';
import db from '../config/db.js';
import { fileURLToPath } from 'url';

const router = express.Router();

// Setup multer storage
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Save to backend/routes/uploads to match existing folder
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random()*1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// POST /api/upload/person
router.post('/person', upload.single('image'), async (req, res) => {
  try {
    const { person_name, age_estimate, category, color_description, description, address, added_by } = req.body;
    const image_url = req.file ? '/uploads/' + req.file.filename : null;
    const sql = 'INSERT INTO persons (name, age_estimate, color, category, image_url, description, address, added_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    await db.execute(sql, [person_name || null, age_estimate || null, color_description || null, category || null, image_url, description || null, address || null, added_by || null]);
    res.json({ message: 'Person reported successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
