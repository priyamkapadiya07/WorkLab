const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Connect to database
connectDB();

// Basic route for testing
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'WorkLab API is running' });
});

// Import and mount routes (to be created)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/github', require('./routes/github'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Keep-alive self-pinging to prevent Render from sleeping
  if (process.env.NODE_ENV === 'production') {
    const https = require('https');
    const SERVER_URL = process.env.SERVER_URL || `https://worklab-api.onrender.com`;
    
    // Ping every 14 minutes (840,000 milliseconds)
    setInterval(() => {
      https.get(`${SERVER_URL}/api/health`, (res) => {
        console.log(`[Self-Ping] Woke up at ${new Date().toISOString()} - Status: ${res.statusCode}`);
      }).on('error', (err) => {
        console.error(`[Self-Ping Error]: ${err.message}`);
      });
    }, 14 * 60 * 1000);
  }
});

module.exports = app;
