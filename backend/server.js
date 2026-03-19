require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

// Connect to Database
const connectDB = require('./config/db');
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
const userRoutes = require('./routes/userRoutes');
const cropRoutes = require('./routes/cropRoutes');
const contentRoutes = require('./routes/contentRoutes');
const marketRoutes = require('./routes/marketRoutes');
const communityRoutes = require('./routes/communityRoutes');
const adminRoutes = require('./routes/adminRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const aiRoutes = require('./routes/aiRoutes');

app.use('/api/users', userRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/ai', aiRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Server is healthy and running',
      timestamp: new Date().toISOString()
    }
  });
});

// Fallback route 
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
