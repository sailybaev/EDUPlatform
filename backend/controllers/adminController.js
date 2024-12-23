const User = require('../models/User');
const Course = require('../models/Course');
const bcrypt = require('bcryptjs');

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