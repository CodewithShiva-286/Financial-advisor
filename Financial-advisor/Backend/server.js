/**
 * Financial Advisor Web App - Backend Server
 * Main entry point for Express server
 * Compatible with both local development and Vercel serverless
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./db');
require('dotenv').config();

const app = express();

// ------------------- Middleware -------------------
app.use(cors()); // Enable CORS for frontend communication
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true }));

// ------------------- MongoDB Connection Middleware -------------------
// Connect to MongoDB before handling requests (serverless-friendly)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    if (error.message.includes('authentication failed')) {
      console.error('💡 Tip: Check your MongoDB username and password');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('💡 Tip: Check your internet connection and MongoDB cluster URL');
    } else if (error.message.includes('IP')) {
      console.error('💡 Tip: Add your IP address to MongoDB Atlas Network Access whitelist');
    }
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
    });
  }
});

// ------------------- Import Routes -------------------
const authRoutes = require('./routes/auth');
const sipRoutes = require('./routes/sip');
const chatRoutes = require('./routes/chat');
const newsRoutes = require('./routes/news');
const stocksRoutes = require('./routes/stocks');

// ------------------- Use Routes -------------------
app.use('/api/auth', authRoutes);
app.use('/api/sip', sipRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/stocks', stocksRoutes);

// ------------------- Health Check -------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// ------------------- Serve Frontend -------------------
// Serve static files from Frontend folder
app.use(express.static(path.join(__dirname, '../Frontend')));

// For any unknown route, send the frontend index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend', 'index.html'));
});

// ------------------- Export for Vercel -------------------
// Vercel will use this as the serverless function handler
module.exports = app;

// ------------------- Local Development Server -------------------
// Only start server if running locally (not on Vercel)
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000;
  
  // Connect to MongoDB first, then start server
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📍 Health check: http://localhost:${PORT}/index.html`);
      });
    })
    .catch((error) => {
      console.error('❌ Failed to start server:', error.message);
      process.exit(1);
    });
}