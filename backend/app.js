const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const mongoose = require('mongoose');
const express = require('express');
const auth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5500',
        'http://127.0.0.1:5500',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'https://eduplatform-c8bs.onrender.com'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-auth-token'],
    credentials: true
}));
app.options('*', cors());

app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboardst', dashboardRoutes);

// Protected route middleware
app.get('/pages/dashboard.html', auth, (req, res, next) => {
    next();
});

// Redirect middleware
app.use((req, res, next) => {
    if (req.path === '/') {
        return res.redirect('/pages/login.html');
    }
    next();
});

// 404 handler
app.use((req, res) => {
    if (req.accepts('html')) {
        res.status(404).sendFile(path.join(__dirname, '../frontend/pages/404.html'));
    } else {
        res.status(404).json({ message: 'Not found' });
    }
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));