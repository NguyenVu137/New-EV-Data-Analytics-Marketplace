import actionTypes from '../actions/actionTypes';

/**
 * EV Analytics Reducer (Dashboard)
 * Separate from admin analytics
 */

const initialState = {
    data: null,
    loading: false,
    error: null,
    lastUpdated: null
};

const evAnalyticsReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.FETCH_EV_ANALYTICS_START:
            return {
                ...state,
                loading: true,
                error: null
            };

        case actionTypes.FETCH_EV_ANALYTICS_SUCCESS:
            return {
                ...state,
                loading: false,
                data: action.payload || state.data,
                error: null,
                lastUpdated: new Date().toISOString()
            };

        case actionTypes.FETCH_EV_ANALYTICS_ERROR:
            return {
                ...state,
                loading: false,
                error: action.payload || 'Unknown error occurred',
                data: state.data
            };

        case actionTypes.PROCESS_LOGOUT:
            return initialState;

        default:
            return state;
    }
};

export default evAnalyticsReducer;
