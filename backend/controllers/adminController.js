const User = require('../models/User');
const Course = require('../models/Course');
const bcrypt = require('bcryptjs');
const Ticket = require('../models/Ticket');
const TicketDone = require('../models/TicketsDone');

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .populate('courses', 'title description'); // Only populate necessary fields
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update user info
exports.updateUser = async (req, res) => {
    try {
        const { who, courses } = req.body;
        const userId = req.params.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update role if provided
        if (who) {
            user.who = who;
        }

        // Only update courses if explicitly provided
        if (courses) {
            // Clear previous course assignments
            await Course.updateMany(
                { assignedTo: userId },
                { $pull: { assignedTo: userId } }
            );

            // Set new courses
            user.courses = courses;
            
            // Update course assignments only for selected courses
            if (courses.length > 0) {
                await Course.updateMany(
                    { _id: { $in: courses } },
                    { $addToSet: { assignedTo: userId } }
                );
            }
        }

        await user.save();
        res.json({ success: true, message: 'User updated successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create new course
exports.createCourse = async (req, res) => {
    const { title, description } = req.body;

    try {
        const course = new Course({ title, description });
        await course.save();
        res.json({ success: true, message: 'Course created successfully', course });
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await User.findByIdAndDelete(id);
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Get all courses
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find()
            .populate('assignedTo', 'name surname email');
        
        const coursesWithDetails = courses.map(course => ({
            _id: course._id,
            title: course.title,
            description: course.description,
            assignedCount: course.assignedTo.length,
            assignedUsers: course.assignedTo.map(user => ({
                name: `${user.name} ${user.surname}`,
                email: user.email
            }))
        }));

        res.json({ success: true, courses: coursesWithDetails });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        res.json({ success: true, message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateCourse = async (req, res) => {
    try {
        const { title, description } = req.body;
        const courseId = req.params.id;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        course.title = title;
        course.description = description;
        await course.save();

        res.json({ success: true, message: 'Course updated successfully', course });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all tickets
exports.getAllTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find()
            .populate('user', 'name surname email')
            .populate('responses.responder', 'name surname')
            .sort({ createdAt: -1 });
        res.json({ success: true, tickets });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get ticket details
exports.getTicketDetails = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('user', 'name surname email')
            .populate('responses.responder', 'name surname');
        
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }
        
        res.json({ success: true, ticket });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Accept ticket
exports.acceptTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }
        
        ticket.status = 'in-progress';
        await ticket.save();
        
        res.json({ success: true, message: 'Ticket accepted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Reject ticket
exports.rejectTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }
        
        ticket.status = 'closed';
        await ticket.save();
        
        res.json({ success: true, message: 'Ticket rejected' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Respond to ticket
exports.respondToTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }
        
        ticket.responses.push({
            responder: req.user.id,
            message: req.body.message
        });
        
        await ticket.save();
        res.json({ success: true, message: 'Response added successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Complete ticket
exports.completeTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }
        
        // Create new completed ticket
        const completedTicket = new TicketDone({
            user: ticket.user,
            subject: ticket.subject,
            description: ticket.description,
            priority: ticket.priority,
            createdAt: ticket.createdAt,
            responses: ticket.responses
        });
        
        await completedTicket.save();
        
        // Delete original ticket
        await Ticket.findByIdAndDelete(req.params.id);
        
        res.json({ success: true, message: 'Ticket marked as completed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};