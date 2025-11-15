import axios from '../axios';


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

export {
    getMarketAnalyticsService,
    getTopDatasetsService,
    getCategoryStatsService,
    getPackageStatsService,
    getMarketOverviewService,
    getTrendingStatsService
};