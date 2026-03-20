const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

require('dotenv').config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/resume', require('./routes/resume'));
app.use('/api/analysis', require('./routes/analysis'));
app.use('/api/roadmap', require('./routes/roadmap'));
app.use('/api/interview', require('./routes/interview'));
app.use('/api/jd-match', require('./routes/jdMatch'));
app.use('/api/ats-scan', require('./routes/atsScan'));
app.use('/api/cover-letter', require('./routes/coverLetter'));
app.use('/api/career-path', require('./routes/careerPath'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
