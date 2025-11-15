import actionTypes from './actionTypes';
import {
    getMarketAnalyticsService,
    getTopDatasetsService,
    getCategoryStatsService,
    getPackageStatsService,
    getMarketOverviewService,
    getTrendingStatsService
} from '../../services/analyticsService';

export const fetchMarketAnalytics = () => {
    return async (dispatch) => {
        dispatch({ type: actionTypes.FETCH_MARKET_ANALYTICS_START });

        try {
            const res = await getMarketAnalyticsService();

            if (res && res.errCode === 0) {
                dispatch({
                    type: actionTypes.FETCH_MARKET_ANALYTICS_SUCCESS,
                    payload: res.data
                });
                return { success: true, data: res.data };
            } else {
                dispatch({
                    type: actionTypes.FETCH_MARKET_ANALYTICS_FAILED,
                    payload: res?.message || 'Failed to fetch analytics'
                });
                return { success: false, message: res?.message };
            }
        } catch (error) {
            dispatch({
                type: actionTypes.FETCH_MARKET_ANALYTICS_FAILED,
                payload: error.message
            });
            console.error('fetchMarketAnalytics error:', error);
            return { success: false, message: error.response?.data?.message || 'Server error' };
        }
    };
};

export const fetchTopInterestDatasets = (limit = 10) => {
    return async (dispatch) => {
        try {
            const res = await getTopDatasetsService(limit);

            if (res && res.errCode === 0) {
                dispatch({
                    type: actionTypes.FETCH_TOP_INTEREST_DATASETS_SUCCESS,
                    payload: res.data
                });
                return { success: true, data: res.data };
            } else {
                dispatch({
                    type: actionTypes.FETCH_TOP_INTEREST_DATASETS_FAILED
                });
                return { success: false, message: res?.message };
            }
        } catch (error) {
            dispatch({
                type: actionTypes.FETCH_TOP_INTEREST_DATASETS_FAILED
            });
            console.error('fetchTopInterestDatasets error:', error);
            return { success: false, message: error.response?.data?.message || 'Server error' };
        }
    };
};

export const fetchCategoryStats = () => {
    return async (dispatch) => {
        try {
            const res = await getCategoryStatsService();
            return { success: true, data: res.data };
        } catch (error) {
            console.error('fetchCategoryStats error:', error);
            return { success: false, message: error.response?.data?.message || 'Server error' };
        }
    };
};

export const fetchPackageStats = () => {
    return async (dispatch) => {
        try {
            const res = await getPackageStatsService();
            return { success: true, data: res.data };
        } catch (error) {
            console.error('fetchPackageStats error:', error);
            return { success: false, message: error.response?.data?.message || 'Server error' };
        }
    };
};

export const fetchMarketOverview = () => {
    return async (dispatch) => {
        try {
            const res = await getMarketOverviewService();
            return { success: true, data: res.data };
        } catch (error) {
            console.error('fetchMarketOverview error:', error);
            return { success: false, message: error.response?.data?.message || 'Server error' };
        }
    };
};

export const fetchTrendingStats = (days = 7) => {
    return async (dispatch) => {
        try {
            const res = await getTrendingStatsService(days);
            return { success: true, data: res.data };
        } catch (error) {
            console.error('fetchTrendingStats error:', error);
            return { success: false, message: error.response?.data?.message || 'Server error' };
        }
    };
};