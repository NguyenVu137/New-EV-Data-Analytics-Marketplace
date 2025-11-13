import actionTypes from '../actions/actionTypes';

const initialState = {
    isLoadingGender: false,
    genders: [],
    roles: [],
    users: [],
    datasets: [],
    categories: [],
    formats: [],
    statuses: [],
    topDatas: []
};

const adminReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.FETCH_GENDER_START:
            return {
                ...state,
                isLoadingGender: true
            };

        case actionTypes.FETCH_GENDER_SUCCESS:
            return {
                ...state,
                genders: action.data,
                isLoadingGender: false
            };

        case actionTypes.FETCH_GENDER_FAILED:
            console.log('failed: ', action);
            return {
                ...state,
                genders: [],
                isLoadingGender: false
            };

        case actionTypes.FETCH_ROLE_SUCCESS:
            return {
                ...state,
                roles: action.data
            };

        case actionTypes.FETCH_ROLE_FAILED:
            return {
                ...state,
                roles: []
            };

        default:
            return state;
        case actionTypes.FETCH_ALL_USERS_SUCCESS:
            state.users = action.users;
            return {
                ...state
            };

        case actionTypes.FETCH_ALL_USERS_FAILED:
            state.users = action.users;
            return {
                ...state
            };
        case actionTypes.FETCH_ALL_DATASETS_SUCCESS:
            return {
                ...state,
                datasets: action.datasets
            };

        case actionTypes.FETCH_ALL_DATASETS_FAILED:
            return {
                ...state,
                datasets: []
            };
        case actionTypes.FETCH_CATEGORY_SUCCESS:
            return {
                ...state,
                categories: action.data
            };
        case actionTypes.FETCH_CATEGORY_FAILED:
            return {
                ...state,
                categories: []
            };

        case actionTypes.FETCH_FORMAT_SUCCESS:
            return {
                ...state,
                formats: action.data
            };

        case actionTypes.FETCH_FORMAT_FAILED:
            return {
                ...state,
                formats: []
            };

        case actionTypes.FETCH_STATUS_SUCCESS:
            return {
                ...state,
                statuses: action.data
            };

        case actionTypes.FETCH_STATUS_FAILED:
            return {
                ...state,
                statuses: []
            };

        case actionTypes.FETCH_TOP_DATAS_SUCCESS:

            return {
                ...state,
                topDatas: action.datas
            };

        case actionTypes.FETCH_TOP_DATAS_FAILED:
            return {
                ...state,
                topDatas: []
            };

    }


};

export default adminReducer;
