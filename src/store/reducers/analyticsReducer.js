import actionTypes from '../actions/actionTypes';

const initialState = {
    isLoadingAnalytics: false,
    marketAnalytics: null,
    analyticsError: null,

    topInterestDatasets: [],

    categoryStats: [],
    packageStats: [],
    marketOverview: null,
    trendingStats: []
};

const analyticsReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.FETCH_MARKET_ANALYTICS_START:
            return {
                ...state,
                isLoadingAnalytics: true,
                analyticsError: null
            };

        case actionTypes.FETCH_MARKET_ANALYTICS_SUCCESS:
            return {
                ...state,
                isLoadingAnalytics: false,
                marketAnalytics: action.payload,
                topInterestDatasets: action.payload?.topDatasets || [],
                categoryStats: action.payload?.categoryStats || [],
                packageStats: action.payload?.packageStats || [],
                marketOverview: action.payload?.marketOverview || null,
                trendingStats: action.payload?.trendingStats || [],
                analyticsError: null
            };

        case actionTypes.FETCH_MARKET_ANALYTICS_FAILED:
            return {
                ...state,
                isLoadingAnalytics: false,
                marketAnalytics: null,
                analyticsError: action.payload
            };

        case actionTypes.FETCH_TOP_INTEREST_DATASETS_SUCCESS:
            return {
                ...state,
                topInterestDatasets: action.payload
            };

        case actionTypes.FETCH_TOP_INTEREST_DATASETS_FAILED:
            return {
                ...state,
                topInterestDatasets: []
            };

        default:
            return state;
    }
};

export default analyticsReducer;