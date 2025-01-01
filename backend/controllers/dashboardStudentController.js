const User = require('../models/User');
const ReadingProgress = require('../models/ReadingProgress');
const Performance = require('../models/Perfomance.js');
const Event = require('../models/Event.js');
const bcrypt = require('bcryptjs');
const Ticket = require('../models/Ticket');
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
                name: user.name,
                surname: user.surname,
                email: user.email,
                phoneNum: user.phoneNum,
                IIN: user.IIN,
                profilePicture: user.profilePicture,
                school: user.school,
                class: user.class,
                readingGoal: user.readingGoal,
                createdAt: user.createdAt,
                who: user.who
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


exports.changePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const isMatch = await bcrypt.compare(req.body.oldPassword, user.password);
        
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }   
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.newPassword, salt);
        await user.save();
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message 
        });
    }
};

// Create new ticket
exports.createTicket = async (req, res) => {
    try {
        const { subject, description, priority } = req.body;
        const ticket = new Ticket({
            user: req.user.id,
            subject,
            description,
            priority
        });
        await ticket.save();
        res.json({ success: true, ticket });
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message 
        });
    }
};

// Get user tickets
exports.getUserTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({ user: req.user.id })
            .sort({ createdAt: -1 });
        res.json({ success: true, tickets });
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message 
        });
    }
};

// Get ticket details
exports.getTicketDetails = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('user', 'name surname email')
            .populate('responses.responder', 'name surname who');
        
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        if (ticket.user._id.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        res.json({ success: true, ticket });
    } catch (error) {
        console.error('Error fetching ticket details:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message 
        });
    }
};

// Respond to ticket
exports.respondToTicket = async (req, res) => {
    try {
        const { message } = req.body;
        const ticket = await Ticket.findById(req.params.id);
        
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        ticket.responses.push({
            responder: req.user.id,
            message
        });

        await ticket.save();
        res.json({ success: true, ticket });
    } catch (error) {
        console.error('Error responding to ticket:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message 
        });
    }
};