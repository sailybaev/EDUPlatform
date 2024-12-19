const User = require('../models/User');
const Task = require('../models/Task');
const ReadingProgress = require('../models/ReadingProgress');
const Exam = require('../models/Exam.js'); 

// Get user profile
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password'); 
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                surname: user.surname,
                email: user.email,
                profilePicture: user.profilePicture,
                school: user.school,
                class: user.class,
                readingGoal: user.readingGoal,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: error.message 
        });
    }
};

// Get reading progress
exports.getReadingProgress = async (req, res) => {
    try {
        const progress = await ReadingProgress.find({ user: req.user.id });
        const totalBooks = await ReadingProgress.countDocuments({ user: req.user.id });
        const completedBooks = progress.filter(book => book.completed).length;

        res.json({
            success: true,
            totalBooks, 
            completedBooks,
            progress
        });
    } catch (error) {
        console.error('Reading progress error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: error.message 
        });
    }
};

//get exam perfomance
exports.getExamPerformance = async (req, res) => {
    try {
        const performance = await Exam.find({ 
            user: req.user.id 
        })
        .sort({ date: -1 })
        .limit(5)
        .select('subject date location notes');

        if (!performance) {
            return res.status(404).json({
                success: false,
                message: 'No exam performance found'
            });
        }

        res.json({
            success: true,
            performance: performance.map(exam => ({
                subject: exam.subject,
                date: exam.date,
                location: exam.location,
                notes: exam.notes
            }))
        });
    } catch (error) {
        console.error('Performance fetch error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message 
        });
    }
};

// Get upcoming tasks
exports.getUpcomingTasks = async (req, res) => {
    try {
        const tasks = await Task.find({
            user: req.user.id,
            dueDate: { $gte: new Date() }
        })
        .sort({ dueDate: 1 })
        .limit(5);

        res.json(tasks);
    } catch (error) {
        console.error('Tasks fetch error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};