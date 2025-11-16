import axios from '../axios';

// MARKET ANALYTICS
const getMarketAnalyticsService = () => {
    return axios.get('/api/analytics/market');
};


const getTopDatasetsService = (limit = 10) => {
    return axios.get(`/api/analytics/top-datasets?limit=${limit}`);
};


const getCategoryStatsService = () => {
    return axios.get('/api/analytics/categories');
};


const getPackageStatsService = () => {
    return axios.get('/api/analytics/packages');
};


const getMarketOverviewService = () => {
    return axios.get('/api/analytics/overview');
};


const getTrendingStatsService = (days = 7) => {
    return axios.get(`/api/analytics/trending?days=${days}`);
};
// AI INSIGHTS
const getAIInsightsService = (forceRefresh = false) => {
    return axios.get(`/api/analytics/ai-insights?refresh=${forceRefresh}`);
};

const regenerateAIInsightsService = () => {
    return axios.post('/api/analytics/ai-insights/regenerate');
};

const clearAIInsightsCacheService = () => {
    return axios.delete('/api/analytics/ai-insights/cache');
};

export {
    // Market Analytics
    getMarketAnalyticsService,
    getTopDatasetsService,
    getCategoryStatsService,
    getPackageStatsService,
    getMarketOverviewService,
    getTrendingStatsService,

    // AI Insights
    getAIInsightsService,
    regenerateAIInsightsService,
    clearAIInsightsCacheService
};
