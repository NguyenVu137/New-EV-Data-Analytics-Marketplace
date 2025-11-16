const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const { calculateMonthlyAnalytics } = require('../scripts/calculate-analytics-monthly');

let router = express.Router();

router.get('/get-analytics', analyticsController.getAnalytics);
router.get('/get-available-months', analyticsController.getAvailableMonths);
router.get('/get-datasets-by-day', analyticsController.getDatasetsByDay);

/*
    recalculate monthly analytics when page loads
 */
router.post('/recalculate-analytics-monthly', async (req, res) => {
    try {
        console.log('[recalculate-analytics-monthly] Starting monthly analytics calculation...');
        const result = await calculateMonthlyAnalytics();
        
        console.log('[recalculate-analytics-monthly] ✅ Monthly analytics calculated successfully');
        res.status(200).json({
            success: true,
            message: 'Monthly analytics recalculated successfully',
            result: result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('[recalculate-analytics-monthly] Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error recalculating monthly analytics',
            error: error.message
        });
    }
});

/*
 * Auto-calculate analytics when page loads
 */
router.post('/recalculate-analytics', async (req, res) => {
    try {
        console.log('[recalculate-analytics] Starting analytics recalculation...');
        
        // Calculate monthly analytics
        const result = await calculateMonthlyAnalytics();
        
        console.log('[recalculate-analytics] ✅ All analytics recalculated successfully');
        res.status(200).json({
            success: true,
            message: 'Analytics recalculated successfully',
            result: result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('[recalculate-analytics] Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error recalculating analytics',
            error: error.message
        });
    }
});

module.exports = router;
