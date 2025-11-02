/**
 * Financial Advisor Web App - Backend Server
 * Main entry point for Express server
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ------------------- Middleware -------------------
app.use(cors()); // Enable CORS for frontend communication
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true }));

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

// ------------------- MongoDB Connection -------------------
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas successfully');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  });

// ------------------- Start Server -------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/index.html`);
});

module.exports = app;