const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String },
    notes: { type: String },
});

module.exports = mongoose.model('Exam', ExamSchema);