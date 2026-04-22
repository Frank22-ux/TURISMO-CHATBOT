const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const activityController = require('./controllers/activityController');
const { optionalAuthMiddleware } = require('./middlewares/authMiddleware');
const authRoutes = require('./routes/authRoutes');
const hostRoutes = require('./routes/hostRoutes');
const messageRoutes = require('./routes/messageRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const touristRoutes = require('./routes/touristRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || true,
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('dev'));

// Static files — serve the compiled Vite build in production
const frontendPath = path.resolve(__dirname, '../../modern-frontend/dist');
app.use(express.static(frontendPath));

// Routes
app.get('/api/debug', (req, res) => res.json({ status: 'API is working', message: 'If you see this, /api routes are registered' }));
app.get('/api/activities', activityController.getAllActivities);
app.get('/api/activities/search', activityController.getAllActivities);
app.get('/api/activities/:id', optionalAuthMiddleware, activityController.getActivityDetails);
app.get('/api/activities/:id/availability', activityController.getActivityAvailability);
app.use('/api/auth', authRoutes);
app.use('/api/host', hostRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/tourist', touristRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Catch-all to serve index.html for client-side routing (Using regex literal for Express 5 compatibility)
app.get(/^(?!\/api).+/, (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

module.exports = app;
