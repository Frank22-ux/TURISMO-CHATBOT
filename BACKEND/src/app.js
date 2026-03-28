const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const activityController = require('./controllers/activityController');
const authRoutes = require('./routes/authRoutes');
const hostRoutes = require('./routes/hostRoutes');
const messageRoutes = require('./routes/messageRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const touristRoutes = require('./routes/touristRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('dev'));

// Static files
const frontendPath = path.resolve(__dirname, '../../modern-frontend');
app.use(express.static(frontendPath));

// Routes
app.get('/api/debug', (req, res) => res.json({ status: 'API is working', message: 'If you see this, /api routes are registered' }));
app.get('/api/activities', activityController.getAllActivities);
app.get('/api/activities/:id', activityController.getActivityDetails);
app.use('/api/auth', authRoutes);
app.use('/api/host', hostRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/tourist', touristRoutes);
app.use('/api/reviews', reviewRoutes);

// Catch-all to serve index.html for client-side routing (Using regex literal for Express 5 compatibility)
app.get(/^(?!\/api).+/, (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

module.exports = app;
