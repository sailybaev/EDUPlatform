const mongoose = require('mongoose');

const ReadingProgressSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookTitle: { type: String, required: true },
    author: { type: String },
    pagesRead: { type: Number, default: 0 },
    totalPages: { type: Number },
    startDate: { type: Date },
    completed: { type: Boolean, default: false },
});

module.exports = mongoose.model('ReadingProgress', ReadingProgressSchema);