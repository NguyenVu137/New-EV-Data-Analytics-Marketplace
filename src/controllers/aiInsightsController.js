const aiInsightsService = require('../services/aiInsightsService');

const getAIInsights = async (req, res) => {
    try {
        const forceRefresh = req.query.refresh === 'true';

        console.log(`📥 GET /api/analytics/ai-insights (refresh: ${forceRefresh})`);

        const insights = await aiInsightsService.getAIInsights(forceRefresh);

        return res.status(200).json({
            errCode: 0,
            message: 'AI insights retrieved successfully',
            data: insights
        });
    } catch (error) {
        console.error('❌ getAIInsights controller error:', error);
        return res.status(500).json({
            errCode: -1,
            message: 'Failed to generate AI insights',
            error: error.message
        });
    }
};

const regenerateInsights = async (req, res) => {
    try {
        console.log('🔄 POST /api/analytics/ai-insights/regenerate');

        const insights = await aiInsightsService.generateAIInsights();

        return res.status(200).json({
            errCode: 0,
            message: 'AI insights regenerated successfully',
            data: insights
        });
    } catch (error) {
        console.error('❌ regenerateInsights error:', error);
        return res.status(500).json({
            errCode: -1,
            message: 'Failed to regenerate AI insights',
            error: error.message
        });
    }
};

const clearCache = async (req, res) => {
    try {
        console.log('🗑️ DELETE /api/analytics/ai-insights/cache');

        aiInsightsService.clearCache();

        return res.status(200).json({
            errCode: 0,
            message: 'Cache cleared successfully'
        });
    } catch (error) {
        console.error('❌ clearCache error:', error);
        return res.status(500).json({
            errCode: -1,
            message: 'Failed to clear cache',
            error: error.message
        });
    }
};

module.exports = {
    getAIInsights,
    regenerateInsights,
    clearCache
};