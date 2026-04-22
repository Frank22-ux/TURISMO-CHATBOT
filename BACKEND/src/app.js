const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
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

// CORS — explicitly allow Vercel frontend and local dev environments
const allowedOrigins = [
    // Production frontend on Vercel (hardcoded as safe fallback)
    'https://turismo-chatbot.vercel.app',
    // Also allow any custom domain set via env var in Render dashboard
    process.env.FRONTEND_URL,
    // Local development
    'http://localhost:5173',
    'http://localhost:3000',
].filter(Boolean); // Remove undefined/null entries

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin: curl, Postman, Render health checks
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        console.warn(`[CORS] Blocked request from origin: ${origin}`);
        callback(new Error(`CORS policy: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

// Apply CORS globally — must run BEFORE route handlers
app.use(cors(corsOptions));
// Handle preflight OPTIONS requests for all routes
// NOTE: Express v5 does not support '*' wildcard — use regex instead
app.options(/.*/, cors(corsOptions));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('dev'));

// ─── API Routes ────────────────────────────────────────────────────────────────
app.get('/api/debug', (req, res) => res.json({
    status: 'API is working',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
}));
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

// ─── 404 for unknown API routes ────────────────────────────────────────────────
// NOTE: Express v5 + path-to-regexp v8 no longer accepts bare wildcards like '/api/*'
// Use '/api/' (trailing slash) as the catch-all prefix instead.
app.use('/api/', (req, res) => {
    res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

// ─── Root health check ─────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({ message: 'ISTPET Turismo API — Backend is live ✅', version: '1.0.0' });
});

module.exports = app;
