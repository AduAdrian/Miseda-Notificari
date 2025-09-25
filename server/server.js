const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
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

// Email configuration
const emailTransporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify email connection (optional)
if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
  emailTransporter.verify((error, success) => {
    if (error) {
      console.error('Email configuration error:', error);
    } else {
      console.log('Email server is ready to take messages');
    }
  });
}

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
    const { nume, prenume, telefon, email, password } = req.body;
    
    // Validation: require nume, prenume, password, and at least one of telefon or email
    if (!nume || !prenume || !password) {
      return res.status(400).json({ 
        message: 'Nume, prenume și parola sunt obligatorii' 
      });
    }

    if (!telefon && !email) {
      return res.status(400).json({ 
        message: 'Cel puțin numărul de telefon sau email-ul este obligatoriu' 
      });
    }

    // Check if user already exists
    let checkUserQuery = 'SELECT * FROM users WHERE ';
    let queryParams = [];
    let conditions = [];

    if (email) {
      conditions.push('email = ?');
      queryParams.push(email);
    }
    
    if (telefon) {
      conditions.push('telefon = ?');
      queryParams.push(telefon);
    }

    checkUserQuery += conditions.join(' OR ');

    db.query(checkUserQuery, queryParams, async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Eroare la baza de date' });
      }
      
      if (results.length > 0) {
        return res.status(400).json({ 
          message: 'Un utilizator cu acest email sau număr de telefon există deja' 
        });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insert new user
      const insertUser = 'INSERT INTO users (nume, prenume, telefon, email, password, created_at) VALUES (?, ?, ?, ?, ?, NOW())';
      db.query(insertUser, [nume, prenume, telefon || null, email || null, hashedPassword], (err, result) => {
        if (err) {
          console.error('Error creating user:', err);
          return res.status(500).json({ message: 'Eroare la crearea utilizatorului' });
        }
        
        res.status(201).json({ 
          message: 'Utilizator creat cu succes',
          userId: result.insertId 
        });
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Eroare de server' });
  }
});

// User login
app.post('/api/login', (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return res.status(400).json({ 
        message: 'Email/telefon și parola sunt obligatorii' 
      });
    }

    // Check if login is email or phone
    const isEmail = emailOrPhone.includes('@');
    const loginField = isEmail ? 'email' : 'telefon';
    
    const query = `SELECT * FROM users WHERE ${loginField} = ?`;
    db.query(query, [emailOrPhone], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Eroare la baza de date' });
      }

      if (results.length === 0) {
        return res.status(401).json({ 
          message: 'Email/telefon sau parola incorectă' 
        });
      }

      const user = results[0];
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ 
          message: 'Email/telefon sau parola incorectă' 
        });
      }

      const token = jwt.sign(
        { 
          userId: user.id, 
          nume: user.nume, 
          prenume: user.prenume,
          email: user.email,
          telefon: user.telefon
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Autentificare reușită',
        token,
        user: {
          id: user.id,
          nume: user.nume,
          prenume: user.prenume,
          email: user.email,
          telefon: user.telefon
        }
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Eroare de server' });
  }
});

// Forgot password - Request reset
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { emailOrPhone } = req.body;

    if (!emailOrPhone) {
      return res.status(400).json({ 
        message: 'Te rugăm să introduci email-ul sau numărul de telefon' 
      });
    }

    // Check if it's email or phone
    const isEmail = emailOrPhone.includes('@');
    
    if (!isEmail) {
      return res.status(400).json({ 
        message: 'Momentan funcția de resetare parolă prin SMS nu este disponibilă. Te rugăm să folosești email-ul.' 
      });
    }

    const loginField = 'email';
    const query = `SELECT * FROM users WHERE ${loginField} = ?`;
    
    db.query(query, [emailOrPhone], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Eroare la baza de date' });
      }

      if (results.length === 0) {
        return res.status(404).json({ 
          message: 'Nu există un cont cu acest email' 
        });
      }

      const user = results[0];
      
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expires = new Date();
      expires.setHours(expires.getHours() + 1); // Token expires in 1 hour

      // Store token in database
      const tokenQuery = 'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)';
      db.query(tokenQuery, [user.id, resetToken, expires], async (tokenErr) => {
        if (tokenErr) {
          console.error('Token storage error:', tokenErr);
          return res.status(500).json({ message: 'Eroare la generarea token-ului' });
        }

        // Send email
        try {
          const resetUrl = `${process.env.FRONTEND_URL || 'https://misedainspectsrl.ro'}/reset-password?token=${resetToken}`;
          
          await emailTransporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME || 'Miseda Inspect SRL'}" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
            to: user.email,
            subject: 'Resetare Parolă - Miseda Inspect SRL',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Resetare Parolă</h2>
                <p>Bună ziua ${user.nume} ${user.prenume},</p>
                <p>Ați solicitat resetarea parolei pentru contul dumneavoastră.</p>
                <p>Faceți clic pe butonul de mai jos pentru a reseta parola:</p>
                <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
                  Resetează Parola
                </a>
                <p>Sau copiați și lipiți acest link în browser:</p>
                <p style="word-break: break-all; color: #666;">${resetUrl}</p>
                <p style="color: #666; font-size: 14px;">
                  <strong>Acest link va expira în 1 oră.</strong><br>
                  Dacă nu ați solicitat această resetare, ignorați acest email.
                </p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #999; font-size: 12px;">
                  Acest email a fost trimis automat de sistemul Miseda Inspect SRL.
                </p>
              </div>
            `
          });

          res.json({ 
            message: 'Link-ul de resetare a fost trimis pe email. Verificați căsuța de email.' 
          });
        } catch (emailError) {
          console.error('Email sending error:', emailError);
          res.status(500).json({ 
            message: 'Eroare la trimiterea email-ului. Încercați din nou mai târziu.' 
          });
        }
      });
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Eroare de server' });
  }
});

// Reset password with token
app.post('/api/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ 
        message: 'Token-ul și parola nouă sunt obligatorii' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'Parola trebuie să aibă cel puțin 6 caractere' 
      });
    }

    // Check if token is valid and not expired
    const tokenQuery = `
      SELECT prt.*, u.id as user_id, u.nume, u.prenume, u.email 
      FROM password_reset_tokens prt
      JOIN users u ON prt.user_id = u.id
      WHERE prt.token = ? AND prt.expires_at > NOW()
    `;

    db.query(tokenQuery, [token], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Eroare la baza de date' });
      }

      if (results.length === 0) {
        return res.status(400).json({ 
          message: 'Token invalid sau expirat' 
        });
      }

      const user = results[0];

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update user password
      const updateQuery = 'UPDATE users SET password = ? WHERE id = ?';
      db.query(updateQuery, [hashedPassword, user.user_id], (updateErr) => {
        if (updateErr) {
          console.error('Password update error:', updateErr);
          return res.status(500).json({ message: 'Eroare la actualizarea parolei' });
        }

        // Delete used token
        const deleteTokenQuery = 'DELETE FROM password_reset_tokens WHERE token = ?';
        db.query(deleteTokenQuery, [token], (deleteErr) => {
          if (deleteErr) {
            console.error('Token deletion error:', deleteErr);
          }
        });

        res.json({ 
          message: 'Parola a fost resetată cu succes. Vă puteți conecta acum cu parola nouă.' 
        });
      });
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Eroare de server' });
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