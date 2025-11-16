const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const { calculateMonthlyAnalytics } = require('../services/analyticsService');

let router = express.Router();

router.get('/get-analytics', analyticsController.getAnalytics);
router.get('/get-available-months', analyticsController.getAvailableMonths);
router.get('/get-datasets-by-day', analyticsController.getDatasetsByDay);

// New routes: Calculate analytics via API
router.post('/calculate-monthly', analyticsController.calculateMonthlyAnalyticsAPI);

/*
    recalculate monthly analytics when page loads
    (Legacy route - for backward compatibility)
 */
router.post('/recalculate-analytics-monthly', async (req, res) => {
    try {
        console.log('[recalculate-analytics-monthly] Starting monthly analytics calculation...');
        const result = await calculateMonthlyAnalytics();
        
        console.log('[recalculate-analytics-monthly] Monthly analytics calculated successfully');
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
 * (Legacy route - for backward compatibility)
 */
router.post('/recalculate-analytics', async (req, res) => {
    try {
        console.log('[recalculate-analytics] Starting analytics recalculation...');
        
        // Calculate monthly analytics
        const result = await calculateMonthlyAnalytics();
        
        console.log('[recalculate-analytics] All analytics recalculated successfully');
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

/*
 * DEBUG: Check database status
 */
router.get('/debug-data', async (req, res) => {
    try {
        const db = require('../models');
        
        // Count datasets
        const datasetCount = await db.Dataset.count();
        const datasets = await db.Dataset.findAll({
            attributes: ['id', 'createdAt'],
            order: [['createdAt', 'ASC']],
            raw: true,
            limit: 20
        });
        
        // Count analytics records
        const analyticsCount = await db.Analytics.count();
        const analyticsMonths = await db.Analytics.findAll({
            attributes: ['month_string'],
            group: ['month_string'],
            order: [['month_string', 'DESC']],
            raw: true,
            subQuery: false
        });
        
        // Count AnalyticsMonth records
        const analyticMonthCount = await db.AnalyticsMonth.count();
        const analyticMonths = await db.AnalyticsMonth.findAll({
            attributes: ['id', 'month_string', 'month', 'year'],
            order: [['month_string', 'DESC']],
            raw: true
        });
        
        res.json({
            success: true,
            data: {
                dataset: {
                    total: datasetCount,
                    sample: datasets
                },
                analytics: {
                    total: analyticsCount,
                    uniqueMonths: analyticsMonths
                },
                analyticsMonth: {
                    total: analyticMonthCount,
                    records: analyticMonths
                }
            }
        });
    } catch (error) {
        console.error('[debug-data] Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
