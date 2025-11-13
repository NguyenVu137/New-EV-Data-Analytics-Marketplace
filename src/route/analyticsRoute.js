const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const { spawn } = require('child_process');
const path = require('path');

let router = express.Router();

router.get('/get-analytics', analyticsController.getAnalytics);
router.get('/get-available-months', analyticsController.getAvailableMonths);
router.get('/get-datasets-by-day', analyticsController.getDatasetsByDay);

/**
 * Auto-calculate analytics when page loads
 * Runs calculate-analytics.js and calculate-analytics-monthly.js
 */
router.post('/recalculate-analytics', async (req, res) => {
    try {
        console.log('[recalculate-analytics] Starting analytics recalculation...');
        
        // Run calculate-analytics first
        const scriptPath = path.join(__dirname, '../scripts/calculate-analytics.js');
        
        const runScript = (scriptPath) => {
            return new Promise((resolve, reject) => {
                const child = spawn('node', [scriptPath], {
                    cwd: path.dirname(scriptPath)
                });
                
                let stdout = '';
                let stderr = '';
                
                child.stdout.on('data', (data) => {
                    stdout += data.toString();
                    console.log('[Script Output]', data.toString());
                });
                
                child.stderr.on('data', (data) => {
                    stderr += data.toString();
                    console.error('[Script Error]', data.toString());
                });
                
                child.on('close', (code) => {
                    if (code === 0) {
                        resolve({ success: true, code, stdout });
                    } else {
                        reject(new Error(`Script failed with code ${code}: ${stderr}`));
                    }
                });
            });
        };
        
        // Run first script
        console.log('[recalculate-analytics] Running calculate-analytics.js...');
        await runScript(scriptPath);
        
        // Run second script
        const scriptPath2 = path.join(__dirname, '../scripts/calculate-analytics-monthly.js');
        console.log('[recalculate-analytics] Running calculate-analytics-monthly.js...');
        await runScript(scriptPath2);
        
        console.log('[recalculate-analytics] ✅ All analytics recalculated successfully');
        res.status(200).json({
            success: true,
            message: 'Analytics recalculated successfully',
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
