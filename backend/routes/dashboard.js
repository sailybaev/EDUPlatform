// backend/routes/dashboard.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Task = require('../models/Task');
const ReadingProgress = require('../models/ReadingProgress');
const Exam = require('../models/Exam');

// Get user profile
router.get('/user/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Get reading progress
router.get('/reading/progress', auth, async (req, res) => {
    try {
        const progress = await ReadingProgress.find({ user: req.user.id });
        const completedBooks = progress.filter(book => book.completed).length;
        const user = await User.findById(req.user.id);
        
        res.json({
            completedBooks,
            totalBooks: user.readingGoal,
            books: progress
        });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Get upcoming tasks
router.get('/tasks/upcoming', auth, async (req, res) => {
    try {
        const tasks = await Task.find({
            user: req.user.id,
            completed: false,
            dueDate: { $gte: new Date() }
        }).sort({ dueDate: 1 }).limit(5);
        
        res.json(tasks);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;