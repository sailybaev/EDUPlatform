const User = require('../models/User');
const ReadingProgress = require('../models/ReadingProgress');
const Performance = require('../models/Perfomance.js');
const Event = require('../models/Event.js');

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


// Get performance data
exports.getPerformanceData = async (req, res) => {
    try {
        const performance = await Performance.find({ user: req.user.id });

        res.json({
            success: true,
            performance
        });
    } catch (error) {
        console.error('Error fetching performance data:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message 
        });
    }
};


// Get upcoming events
exports.getUpcomingEvents = async (req, res) => {
    try {
        console.log('Fetching events for user ID:', req.user.id);
        const events = await Event.find({ 
            user: req.user.id
        }).sort({ date: 1 }).limit(10);

        console.log('Found events:', events);

        res.json({
            success: true,
            events
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message 
        });
    }
};