// backend/models/Event.js
const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true }
});

module.exports = mongoose.model('Event', EventSchema);