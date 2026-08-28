// ============================================================
// 1. IMPORTS & ENVIRONMENT
// ============================================================
require('dotenv').config();
const cors       = require('cors');
const express    = require('express');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const connectDB  = require('./database');

// Import modular routes
const authRoutes = require('./routes/auth');
const snippetRoutes = require('./routes/snippets');

// ============================================================
// 2. DATABASE CONNECTION
// ============================================================
connectDB();

// ============================================================
// 3. EXPRESS APP SETUP
// ============================================================
const app = express();

app.use(helmet()); // Set security headers

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', limiter);

// Support multiple allowed origins via comma-separated CLIENT_URL env var
const allowedOrigins = [
  'http://localhost:3000',
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(o => o.trim()) : [])
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow server-to-server requests (no origin) or whitelisted origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const PORT = process.env.PORT || 5000;

// ============================================================
// 4. ROUTES
// ============================================================
app.use('/api/auth', authRoutes);
app.use('/api/snippets', snippetRoutes);

// ============================================================
// 5. GLOBAL ERROR HANDLER
// ============================================================
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // In production, do not send stack traces!
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// ============================================================
// 6. START SERVER
// ============================================================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

