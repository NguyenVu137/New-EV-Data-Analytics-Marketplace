import actionTypes from '../actions/actionTypes';

const initialState = {
    detailDataset: {},
    loadingDetail: false,
    errorDetail: null,
};
const consumerReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.FETCH_DETAIL_DATASET_START:
            return {
                ...state,
                loadingDetail: true,
                errorDetail: null
            };
        case actionTypes.FETCH_DETAIL_DATASET_SUCCESS:
            return {
                ...state,
                loadingDetail: false,
                detailDataset: action.payload
            };
        case actionTypes.FETCH_DETAIL_DATASET_FAILED:
            return {
                ...state,
                loadingDetail: false,
                errorDetail: action.payload
            };
        default:
            return state;
    }
};

export default consumerReducer;