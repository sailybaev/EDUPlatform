const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const auth = require('./middleware/auth');
const adminRoutes = require('./routes/admin'); // New route

const app = express();

// Security Middleware
app.use(express.json({ limit: '20kb' }));
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS.split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-auth-token'],
    credentials: true
}));

// Security Headers
app.use((req, res, next) => {
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
});

app.options('*', cors());

// Serve static files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboardst', dashboardRoutes);
app.use('/api/admin', adminRoutes); 
app.use('/api/pricing', require('./routes/pricing'));

// Protected route middleware
app.get('/pages/dashboard.html', auth, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/dashboard.html'));
});

// Redirect middleware
app.use((req, res, next) => {
    if (req.path === '/') {
        return res.redirect('/pages/home');
    }
    next();
});

app.use((req, res, next) => {
    if (req.path.endsWith('.html')) {
        const newPath = req.path.slice(0, -5);
        return res.redirect(301, newPath);
    }
    next();
});

// Handle page routes without .html
app.use('/pages/:page', (req, res, next) => {
    const page = req.params.page;
    const filePath = path.join(__dirname, `../frontend/pages/${page}.html`);
    res.sendFile(filePath, err => {
        if (err) next();
    });
});

// 404 handler
app.use((req, res) => {
    if (req.accepts('html')) {
        res.status(404).sendFile(path.join(__dirname, '../frontend/pages/404.html'));
        return;
    }
    res.status(404).json({ msg: 'Not Found' });
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));