const mongoose = require('mongoose');

const PricingPlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    features: [{
        type: String
    }],
    buttonText: {
        type: String,
        default: 'Get started'
    }
});

module.exports = mongoose.model('PricingPlan', PricingPlanSchema); 