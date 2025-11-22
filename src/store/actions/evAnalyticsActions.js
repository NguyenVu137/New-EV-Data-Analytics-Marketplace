import actionTypes from './actionTypes';
import axios from '../../axios';

/**
 * EV Analytics Actions (for Dashboard)
 * Separate from admin analytics
 */

export const fetchEVAnalyticsStart = () => ({
    type: actionTypes.FETCH_EV_ANALYTICS_START
});

export const fetchEVAnalyticsSuccess = (data) => ({
    type: actionTypes.FETCH_EV_ANALYTICS_SUCCESS,
    payload: data
});

export const fetchEVAnalyticsError = (error) => ({
    type: actionTypes.FETCH_EV_ANALYTICS_ERROR,
    payload: error
});

/**
 * Fetch EV Analytics - Thunk Action
 * Lấy analytics của datasets đã mua
 */
export const fetchEVAnalytics = (filters = {}) => {
    return async (dispatch) => {
        dispatch(fetchEVAnalyticsStart());

        try {
            const params = new URLSearchParams();

            if (filters.month?.trim()) {
                params.append('month', filters.month.trim());
            }

            console.log('[My Purchased Analytics] Fetching data with params:', params.toString());

            const response = await axios.get(
                `/api/analytics/my-purchased-data?${params.toString()}`
            );

            console.log('[My Purchased Analytics] API Response:', response);

            let analyticsData = null;
            if (response?.success && response?.data) {
                analyticsData = response.data;
            } else {
                analyticsData = response;
            }

            dispatch(fetchEVAnalyticsSuccess(analyticsData));
        } catch (error) {
            console.error('[My Purchased Analytics] Fetch error:', error);
            dispatch(fetchEVAnalyticsError(error.message || 'Lỗi khi tải dữ liệu'));
        }
    };
};
