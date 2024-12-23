// backend/models/Performance.js
const mongoose = require('mongoose');

const PerformanceSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    subject: { type: String, required: true },
    score: { type: Number, required: true }
});

module.exports = mongoose.model('Performance', PerformanceSchema);