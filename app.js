require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const cron = require('node-cron');

// Middleware imports
const errorHandler = require('./middlewares/errorHandler');
const authMiddleware = require('./middlewares/authMiddleware');
const { apiLimiter } = require('./middlewares/rateLimiter');

// Route imports
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const patientRoutes = require('./routes/patientRoutes');
const visitorRoutes = require('./routes/visitorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

// Job imports
const dataBackup = require('./jobs/dataBackup');
const reportGenerator = require('./jobs/reportGenerator');
const appointmentReminder = require('./jobs/appointmentReminder');

// Security and utility middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(apiLimiter);

// Static files
app.use('/reports', express.static(path.join(__dirname, 'reports')));

// API version prefix
const API_PREFIX = '/api/v1';

// Public routes
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/visitor`, visitorRoutes);

// Protected routes
app.use(`${API_PREFIX}/admin`, authMiddleware, adminRoutes);
app.use(`${API_PREFIX}/doctor`, authMiddleware, doctorRoutes);
app.use(`${API_PREFIX}/patient`, authMiddleware, patientRoutes);
app.use(`${API_PREFIX}/appointments`, authMiddleware, appointmentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date(),
        version: process.env.npm_package_version,
        environment: process.env.NODE_ENV
    });
});

// Schedule jobs
cron.schedule('0 0 * * *', () => dataBackup.createBackup()); // Daily backup at midnight
cron.schedule('0 1 * * *', () => reportGenerator.generateDailyReport(new Date())); // Daily report at 1 AM
appointmentReminder.startScheduledReminders(); // Start appointment reminders

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log('Background jobs initialized');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

module.exports = server;