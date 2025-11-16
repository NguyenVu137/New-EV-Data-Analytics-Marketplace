import actionTypes from './actionTypes';
import axios from '../../axios';

/**
 * Analytics Actions
 * Manages data fetching for analytics dashboard with error handling and validation
 */

// Action Creators - Fetch Analytics
export const fetchAnalyticsStart = () => ({
    type: actionTypes.FETCH_ANALYTICS_START
});

export const fetchAnalyticsSuccess = (data) => {
    // Validate data structure
    if (!data || typeof data !== 'object') {
        console.warn('[Analytics] Received invalid data structure:', data);
    }
    return {
        type: actionTypes.FETCH_ANALYTICS_SUCCESS,
        payload: data
    };
};

export const fetchAnalyticsError = (error) => {
    // Normalize error message
    const errorMessage = typeof error === 'string' 
        ? error 
        : error?.message || 'Lỗi khi tải dữ liệu phân tích';
    
    return {
        type: actionTypes.FETCH_ANALYTICS_ERROR,
        payload: errorMessage
    };
};

/**
 * Mock Analytics Data - For Testing
 * Replace with actual API data when backend is ready
 */
const MOCK_ANALYTICS_DATA = {
    overview: {
        averageSoC: 75,
        totalCharges: 245,
        co2Reduced: 48,
        batteryHealth: 92,
        socTrend: 5,
        chargeTrend: 12,
        co2Trend: 8,
        healthTrend: -2,
        totalRange: 15420,
        efficiency: 5.8
    },
    batteryStats: {
        timestamps: ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5'],
        values: [92, 88, 85, 90, 87]
    },
    socStats: {
        timestamps: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'],
        values: [45, 52, 68, 75, 82, 78, 65]
    },
    chargingStats: {
        timestamps: ['2025-11-08', '2025-11-09', '2025-11-10', '2025-11-11', '2025-11-12'],
        values: [3, 5, 4, 6, 7]
    }
};

/**
 * Fetch Analytics - Thunk Action (UPDATED for Monthly View)
 * 
 * Fetches analytics data from backend for a specific month
 * 
 * @param {Object} filters - Filter parameters (month: 'YYYY-MM')
 * @returns {Function} Redux thunk function
 */
export const fetchAnalytics = (filters = {}) => {
    return async (dispatch) => {
        dispatch(fetchAnalyticsStart());
        
        try {
            // Validate filters
            if (typeof filters !== 'object' || filters === null) {
                throw new Error('Invalid filters provided');
            }

            // Build query parameters
            const params = new URLSearchParams();
            
            // Monthly view: use month parameter if provided
            if (filters.month?.trim()) {
                params.append('month', filters.month.trim());
            } else {
                // Fallback to date range if month not provided
                if (filters.startDate?.trim()) params.append('startDate', filters.startDate.trim());
                if (filters.endDate?.trim()) params.append('endDate', filters.endDate.trim());
            }
            
            // Add other filters
            if (filters.region?.trim()) params.append('region', filters.region.trim());
            if (filters.carType?.trim()) params.append('carType', filters.carType.trim());
            if (filters.batteryType?.trim()) params.append('batteryType', filters.batteryType.trim());

            console.log('[Analytics] Fetching data with params:', params.toString());

            // Try to fetch from API
            let analyticsData = null;
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

                const response = await axios.get(
                    `/api/get-analytics?${params.toString()}`,
                    { signal: controller.signal }
                );

                clearTimeout(timeoutId);

                // axios interceptor returns response.data, so response is already the data object
                // Structure: { success: true, data: {...analytics data...} }
                console.log('[Analytics] API Response:', response);

                // Extract nested data from success response
                if (response?.success && response?.data) {
                    analyticsData = response.data;
                } else {
                    analyticsData = response;
                }

                if (!analyticsData || typeof analyticsData !== 'object' || Object.keys(analyticsData).length === 0) {
                    console.warn('[Analytics] API returned empty data');
                    analyticsData = MOCK_ANALYTICS_DATA;
                }
            } catch (apiError) {
                console.warn('[Analytics] API call failed:', apiError.message);
                // Use mock data as fallback
                analyticsData = MOCK_ANALYTICS_DATA;
            }

            if (!analyticsData || typeof analyticsData !== 'object') {
                throw new Error('Invalid data structure');
            }

            dispatch(fetchAnalyticsSuccess(analyticsData));
            console.log('[Analytics] Data loaded successfully:', {
                month: analyticsData.month || 'N/A',
                overview: analyticsData.overview ? '✓' : '✗',
                trends: analyticsData.trends ? '✓' : '✗',
                dailyData: analyticsData.dailyData ? `✓ (${analyticsData.dailyData.timestamps?.length || 0} days)` : '✗'
            });
        } catch (error) {
            let errorMessage = 'Lỗi khi tải dữ liệu phân tích';

            if (error.name === 'AbortError') {
                errorMessage = 'Yêu cầu timeout - vui lòng thử lại';
            } else if (error.response) {
                const status = error.response.status;
                if (status === 400) {
                    errorMessage = 'Dữ liệu lọc không hợp lệ';
                } else if (status === 401) {
                    errorMessage = 'Vui lòng đăng nhập lại';
                } else if (status === 403) {
                    errorMessage = 'Bạn không có quyền truy cập';
                } else if (status === 404) {
                    errorMessage = 'Dữ liệu phân tích không tìm thấy';
                } else if (status === 500) {
                    errorMessage = 'Lỗi máy chủ - vui lòng thử lại sau';
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            console.error('[Analytics] Fetch error:', {
                message: errorMessage,
                details: error.message,
                status: error.response?.status
            });
            
            dispatch(fetchAnalyticsError(errorMessage));
        }
    };
};
