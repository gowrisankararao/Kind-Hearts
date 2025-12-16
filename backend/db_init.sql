CREATE DATABASE IF NOT EXISTS kindhearts_db;
USE kindhearts_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  phone VARCHAR(30),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS persons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  age_estimate INT,
  color VARCHAR(50),
  category ENUM('child','elderly'),
  image_url VARCHAR(255),
  description TEXT,
  address VARCHAR(255),
  added_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS donations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  donor_name VARCHAR(100),
  message TEXT,
  amount DECIMAL(10,2),
  upi_qr_url VARCHAR(255),
  paid_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
