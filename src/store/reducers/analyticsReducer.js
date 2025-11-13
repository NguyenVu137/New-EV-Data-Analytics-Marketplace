import actionTypes from '../actions/actionTypes';

/**
 * Analytics Reducer
 * Manages analytics state:
 * - data: Analytics data object (overview, batteryStats, socStats, chargingStats)
 * - loading: Boolean flag for loading state
 * - error: Error message if fetch fails
 */

const initialState = {
    data: null,
    loading: false,
    error: null,
    lastUpdated: null
};

const analyticsReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.FETCH_ANALYTICS_START:
            return {
                ...state,
                loading: true,
                error: null
            };
        
        case actionTypes.FETCH_ANALYTICS_SUCCESS:
            return {
                ...state,
                loading: false,
                data: action.payload || state.data,
                error: null,
                lastUpdated: new Date().toISOString()
            };
        
        case actionTypes.FETCH_ANALYTICS_ERROR:
            return {
                ...state,
                loading: false,
                error: action.payload || 'Unknown error occurred',
                data: state.data // Keep existing data on error
            };
        
        default:
            return state;
    }
};

export default analyticsReducer;
