const express = require('express');
const router = express.Router();
const PricingPlan = require('../models/PricingPlan');

router.get('/plans', async (req, res) => {
    try {
        const plans = await PricingPlan.find();
        res.json({ success: true, plans });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router; 