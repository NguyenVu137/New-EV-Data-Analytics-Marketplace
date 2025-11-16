import actionTypes from './actionTypes';
import {
    getMarketAnalyticsService,
    getTopDatasetsService,
    getCategoryStatsService,
    getPackageStatsService,
    getMarketOverviewService,
    getTrendingStatsService,
    getAIInsightsService,
    regenerateAIInsightsService,
    clearAIInsightsCacheService
} from '../../services/analyticsService';
// MARKET ANALYTICS ACTIONS 
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

//  AI INSIGHTS ACTIONS 

export const fetchAIInsights = (forceRefresh = false) => {
    return async (dispatch) => {
        dispatch({ type: actionTypes.FETCH_AI_INSIGHTS_START });

        try {
            const res = await getAIInsightsService(forceRefresh);

            if (res && res.errCode === 0) {
                dispatch({
                    type: actionTypes.FETCH_AI_INSIGHTS_SUCCESS,
                    payload: res.data
                });
                return { success: true, data: res.data };
            } else {
                dispatch({
                    type: actionTypes.FETCH_AI_INSIGHTS_FAILED,
                    payload: res.message || 'Failed to fetch AI insights'
                });
                return { success: false, message: res.message };
            }
        } catch (error) {
            dispatch({
                type: actionTypes.FETCH_AI_INSIGHTS_FAILED,
                payload: error.response?.data?.message || error.message
            });
            console.error('fetchAIInsights error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Server error'
            };
        }
    };
};

export const regenerateAIInsights = () => {
    return async (dispatch) => {
        dispatch({ type: actionTypes.FETCH_AI_INSIGHTS_START });

        try {
            const res = await regenerateAIInsightsService();

            if (res && res.errCode === 0) {
                dispatch({
                    type: actionTypes.FETCH_AI_INSIGHTS_SUCCESS,
                    payload: res.data
                });
                return { success: true, data: res.data };
            } else {
                dispatch({
                    type: actionTypes.FETCH_AI_INSIGHTS_FAILED,
                    payload: res.message
                });
                return { success: false, message: res.message };
            }
        } catch (error) {
            dispatch({
                type: actionTypes.FETCH_AI_INSIGHTS_FAILED,
                payload: error.message
            });
            console.error('regenerateAIInsights error:', error);
            return { success: false, message: error.response?.data?.message || 'Server error' };
        }
    };
};

export const clearAIInsightsCache = () => {
    return async (dispatch) => {
        try {
            const res = await clearAIInsightsCacheService();

            if (res && res.errCode === 0) {
                // Clear state after cache cleared
                dispatch({ type: actionTypes.CLEAR_AI_INSIGHTS });
                return { success: true, message: res.message };
            } else {
                return { success: false, message: res.message };
            }
        } catch (error) {
            console.error('clearAIInsightsCache error:', error);
            return { success: false, message: error.response?.data?.message || 'Server error' };
        }
    };
};