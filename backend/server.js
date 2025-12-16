// backend/server.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import mysql from 'mysql2/promise';
import authRouter from './routes/auth.js';
import donateRouter from './routes/donate.js';
import uploadRouter from './routes/upload.js';
import reportsRouter from './routes/reports.js';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize database on startup
async function initializeDatabase() {
  try {
    // Connect to MySQL without specific database first
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER,
      password: process.env.DB_PASS
    });

    // Create database
    await connection.query('CREATE DATABASE IF NOT EXISTS kindhearts_db');
    
    // Switch to the database
    await connection.changeUser({ database: 'kindhearts_db' });

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        password VARCHAR(255),
        phone VARCHAR(30),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create persons table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS persons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        age_estimate INT,
        color VARCHAR(50),
        category ENUM('child','elderly','disabled'),
        image_url VARCHAR(255),
        description TEXT,
        address VARCHAR(255),
        added_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Create donations table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS donations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        donor_name VARCHAR(100),
        message TEXT,
        amount DECIMAL(10,2),
        upi_qr_url VARCHAR(255),
        paid_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    
    await connection.end();
    console.log('✅ Database initialized successfully');
  } catch (err) {
    console.error('⚠️ Database initialization warning:', err.message);
    // Don't crash the server if DB init fails, it might already exist
  }
}

// Initialize DB before starting server
await initializeDatabase();

/**
 * Middlewares
 */
app.use(cors()); // allow cross-origin
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// log incoming API requests
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

// Preflight handler
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.sendStatus(204);
});

/**
 * Static frontend serving
 */
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));
// Serve shared static directories at the root
app.use('/css', express.static(path.join(__dirname, '..', 'css')));
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));
// Serve uploads (files saved by multer)
app.use('/uploads', express.static(path.join(__dirname, 'routes', 'uploads')));

/**
 * API routes
 */
app.use('/api/auth', authRouter);
app.use('/api/donate', donateRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/reports', reportsRouter);

/**
 * Fallback for unknown API routes
 */
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

/**
 * Fallback to index.html for non-API routes (optional)
 */
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Not found');
    }
  });
});

/**
 * Error handler
 */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err && err.stack ? err.stack : err);
  res.status(500).json({ message: 'Internal server error' });
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`Serving frontend from ${frontendPath}`);
});
