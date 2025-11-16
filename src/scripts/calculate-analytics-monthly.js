const { calculateMonthlyAnalytics } = require('../services/analyticsService');

/**
 * Script để chạy tính analytics theo tháng
 * Dùng: npm run calculate:analytics-monthly
 */

if (require.main === module) {
    calculateMonthlyAnalytics()
        .then(result => {
            console.log('[Analytics Monthly] ✅ Success:', result);
            process.exit(0);
        })
        .catch(error => {
            console.error('[Analytics Monthly] ❌ Error:', error);
            process.exit(1);
        });
}

module.exports = { calculateMonthlyAnalytics };
