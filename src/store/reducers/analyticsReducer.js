import actionTypes from '../actions/actionTypes';

const initialState = {
    isLoadingAnalytics: false,
    marketAnalytics: null,
    analyticsError: null,

    topInterestDatasets: [],

    categoryStats: [],
    packageStats: [],
    marketOverview: null,
    trendingStats: [],

    isLoadingAIInsights: false,
    aiInsights: null,
    aiInsightsError: null
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

        case actionTypes.FETCH_AI_INSIGHTS_START:
            return {
                ...state,
                isLoadingAIInsights: true,
                aiInsightsError: null
            };

        case actionTypes.FETCH_AI_INSIGHTS_SUCCESS:
            return {
                ...state,
                isLoadingAIInsights: false,
                aiInsights: action.payload,
                aiInsightsError: null
            };

        case actionTypes.FETCH_AI_INSIGHTS_FAILED:
            return {
                ...state,
                isLoadingAIInsights: false,
                aiInsightsError: action.payload
            };

        case actionTypes.CLEAR_AI_INSIGHTS:
            return {
                ...state,
                aiInsights: null,
                aiInsightsError: null
            };
        default:
            return state;
    }
};

export default analyticsReducer;