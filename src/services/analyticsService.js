import axios from '../axios';

// MARKET ANALYTICS
const getMarketAnalyticsService = () => {
    return axios.get('/api/analytics/market-overview');
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
    return axios.get('/api/analytics/market-overview');
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

// EV ANALYTICS
const getEVAnalyticsService = (year, month) => {
    return axios.get(`/api/analytics/ev-analytics?year=${year}&month=${month}`);
};

const getEVAvailableMonthsService = () => {
    return axios.get('/api/analytics/ev-analytics/available-months');
};

const getEVDatasetsByDayService = (year, month) => {
    return axios.get(`/api/analytics/ev-analytics/datasets-by-day?year=${year}&month=${month}`);
};

const calculateMonthlyEVAnalyticsService = (year, month) => {
    return axios.post('/api/analytics/ev-analytics/calculate-monthly', { year, month });
};

// USER PURCHASED DATA ANALYTICS
const getMyPurchasedDataService = (year, month) => {
    return axios.get(`/api/analytics/my-purchased-data?year=${year}&month=${month}`);
};

const getMyPurchasedDataAvailableMonthsService = () => {
    return axios.get('/api/analytics/my-purchased-data/available-months');
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
    clearAIInsightsCacheService,

    // EV Analytics
    getEVAnalyticsService,
    getEVAvailableMonthsService,
    getEVDatasetsByDayService,
    calculateMonthlyEVAnalyticsService,

    // User Purchased Data Analytics
    getMyPurchasedDataService,
    getMyPurchasedDataAvailableMonthsService
};
