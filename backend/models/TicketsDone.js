const mongoose = require('mongoose');

const TicketsDoneSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    subject: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    completedAt: {
        type: Date,
        default: Date.now
    },
    responses: [{
        responder: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User' 
        },
        message: String,
        createdAt: { 
            type: Date, 
            default: Date.now 
        }
    }]
});

module.exports = mongoose.model('TicketDone', TicketsDoneSchema); 