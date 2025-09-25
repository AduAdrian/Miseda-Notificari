const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const parseOrigins = (value) => {
  if (!value) {
    return [];
  }
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'https://misedainspectsrl.ro',
  'https://www.misedainspectsrl.ro'
];

const allowedOrigins = Array.from(
  new Set([...defaultOrigins, ...parseOrigins(process.env.ALLOWED_ORIGINS)])
);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn(`Blocked by CORS: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(limiter);
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'notification_app'
});

// Test database connection
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.message);
  } else {
    console.log('Connected to MySQL database');
  }
});

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Notification App API is running!' });
});

// User registration
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const checkUser = 'SELECT * FROM users WHERE email = ? OR username = ?';
    db.query(checkUser, [email, username], async (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }
      
      if (results.length > 0) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insert new user
      const insertUser = 'INSERT INTO users (username, email, password, created_at) VALUES (?, ?, ?, NOW())';
      db.query(insertUser, [username, email, hashedPassword], (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Error creating user' });
        }
        
        res.status(201).json({ 
          message: 'User created successfully',
          userId: result.insertId 
        });
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// User login
app.post('/api/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (results.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const user = results[0];
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user.id, username: user.username, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get notifications
app.get('/api/notifications', authenticateToken, (req, res) => {
  const query = `
    SELECT n.*, u.username as sender_name 
    FROM notifications n 
    LEFT JOIN users u ON n.sender_id = u.id 
    WHERE n.user_id = ? 
    ORDER BY n.created_at DESC
  `;
  
  db.query(query, [req.user.userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    
    res.json(results);
  });
});

// Create notification
app.post('/api/notifications', authenticateToken, (req, res) => {
  const { title, message, type = 'info', user_id } = req.body;
  
  if (!title || !message) {
    return res.status(400).json({ message: 'Title and message are required' });
  }

  const query = `
    INSERT INTO notifications (user_id, sender_id, title, message, type, created_at) 
    VALUES (?, ?, ?, ?, ?, NOW())
  `;
  
  const targetUserId = user_id || req.user.userId;
  
  db.query(query, [targetUserId, req.user.userId, title, message, type], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error creating notification' });
    }
    
    res.status(201).json({ 
      message: 'Notification created successfully',
      notificationId: result.insertId 
    });
  });
});

// Mark notification as read
app.put('/api/notifications/:id/read', authenticateToken, (req, res) => {
  const notificationId = req.params.id;
  
  const query = 'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?';
  
  db.query(query, [notificationId, req.user.userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ message: 'Notification marked as read' });
  });
});

// Get user profile
app.get('/api/profile', authenticateToken, (req, res) => {
  const query = 'SELECT id, username, email, created_at FROM users WHERE id = ?';
  
  db.query(query, [req.user.userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(results[0]);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});