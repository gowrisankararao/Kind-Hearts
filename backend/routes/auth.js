// routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../config/db.js';

const router = express.Router();

/**
 * Helper: basic input cleanup
 */
const cleanString = (value) => (value !== undefined && value !== null ? String(value).trim() : '');

/**
 * Register
 */
router.post('/register', async (req, res) => {
  try {
    const name = cleanString(req.body.name);
    const email = cleanString(req.body.email).toLowerCase();
    const password = req.body.password; // keep as-is
    const phone = cleanString(req.body.phone) || null;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if email already exists
    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    await db.execute(
      'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, phone]
    );

    // Fetch user to return (without password)
    const [rows] = await db.execute(
      'SELECT id, name, email, phone, created_at FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    return res.status(201).json({
      message: 'User registered successfully',
      user: rows[0] || null
    });
  } catch (err) {
    console.error('Register route error:', err.message || err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Login
 */
router.post('/login', async (req, res) => {
  try {
    const email = cleanString(req.body.email).toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const [rows] = await db.execute('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Return user without password
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      created_at: user.created_at
    };

    return res.json({ message: 'Login successful', user: safeUser });
  } catch (err) {
    console.error('Login route error:', err.message || err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
