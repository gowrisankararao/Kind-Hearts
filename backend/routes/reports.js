import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// GET /api/reports?user_id=#
router.get('/', async (req, res) => {
  try {
    const user_id = req.query.user_id;
    if (!user_id) return res.status(400).json([]);
    const [rows] = await db.execute('SELECT * FROM persons WHERE added_by = ? ORDER BY created_at DESC', [user_id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

export default router;
