const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    assignedTo: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', CourseSchema);