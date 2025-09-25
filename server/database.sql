-- Database schema for Notification App-- Indexes for better performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_telefon ON users(telefon);

-- Sample data (optional) - Updated for new schema
INSERT INTO users (nume, prenume, email, password) VALUES 
('Admin', 'User', 'admin@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'); -- password: 'password' these SQL commands in your phpMyAdmin to create the required tables

CREATE DATABASE IF NOT EXISTS notification_app;
USE notification_app;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nume VARCHAR(50) NOT NULL,
    prenume VARCHAR(50) NOT NULL,
    telefon VARCHAR(20) NULL,
    email VARCHAR(100) NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- Constraint to ensure at least one of telefon or email is provided
    CONSTRAINT chk_contact CHECK (telefon IS NOT NULL OR email IS NOT NULL),
    -- Unique constraint for email when it's not null
    UNIQUE KEY unique_email (email),
    -- Unique constraint for telefon when it's not null
    UNIQUE KEY unique_telefon (telefon)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    sender_id INT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for better performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_users_email ON users(email);

-- Sample data (optional)
INSERT INTO users (username, email, password) VALUES 
('admin', 'admin@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'); -- password: 'password'

INSERT INTO notifications (user_id, title, message, type) VALUES 
(1, 'Welcome!', 'Welcome to the notification app!', 'success'),
(1, 'System Update', 'The system will be updated tonight.', 'info');