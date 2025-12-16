import express from 'express';
import db from '../config/db.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { user_id, donor_name, message, amount } = req.body;
    await db.execute('INSERT INTO donations (user_id, donor_name, message, amount, paid_at) VALUES (?, ?, ?, ?, NOW())', [user_id || null, donor_name || null, message || null, amount || 0]);
    res.json({ message: 'Donation recorded. Thank you!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
