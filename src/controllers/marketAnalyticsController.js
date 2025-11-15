const marketAnalyticsService = require('../services/marketAnalyticsService');

const getMarketAnalytics = async (req, res) => {
    try {
        const analytics = await marketAnalyticsService.getFullMarketAnalytics();

        return res.status(200).json({
            errCode: 0,
            message: 'Get market analytics successfully',
            data: analytics
        });
    } catch (error) {
        console.error('getMarketAnalytics error:', error);
        return res.status(500).json({
            errCode: -1,
            message: 'Server error',
            error: error.message
        });
    }
};

const getTopDatasets = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const topDatasets = await marketAnalyticsService.getTopInterestDatasets(limit);

        return res.status(200).json({
            errCode: 0,
            message: 'Get top datasets successfully',
            data: topDatasets
        });
    } catch (error) {
        console.error('getTopDatasets error:', error);
        return res.status(500).json({
            errCode: -1,
            message: 'Server error',
            error: error.message
        });
    }
};

const getCategoryStats = async (req, res) => {
    try {
        const stats = await marketAnalyticsService.getCategoryStatistics();

        return res.status(200).json({
            errCode: 0,
            message: 'Get category statistics successfully',
            data: stats
        });
    } catch (error) {
        console.error('getCategoryStats error:', error);
        return res.status(500).json({
            errCode: -1,
            message: 'Server error',
            error: error.message
        });
    }
};

const getPackageStats = async (req, res) => {
    try {
        const stats = await marketAnalyticsService.getPackageStatistics();

        return res.status(200).json({
            errCode: 0,
            message: 'Get package statistics successfully',
            data: stats
        });
    } catch (error) {
        console.error('getPackageStats error:', error);
        return res.status(500).json({
            errCode: -1,
            message: 'Server error',
            error: error.message
        });
    }
};

const getMarketOverview = async (req, res) => {
    try {
        const overview = await marketAnalyticsService.getMarketOverview();

        return res.status(200).json({
            errCode: 0,
            message: 'Get market overview successfully',
            data: overview
        });
    } catch (error) {
        console.error('getMarketOverview error:', error);
        return res.status(500).json({
            errCode: -1,
            message: 'Server error',
            error: error.message
        });
    }
};


const getTrendingStats = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;
        const stats = await marketAnalyticsService.getTrendingStatistics(days);

        return res.status(200).json({
            errCode: 0,
            message: 'Get trending statistics successfully',
            data: stats
        });
    } catch (error) {
        console.error('getTrendingStats error:', error);
        return res.status(500).json({
            errCode: -1,
            message: 'Server error',
            error: error.message
        });
    }
};

module.exports = {
    getMarketAnalytics,
    getTopDatasets,
    getCategoryStats,
    getPackageStats,
    getMarketOverview,
    getTrendingStats
};