import actionTypes from '../actions/actionTypes';

const initialState = {
    isLoadingGender: false,
    genders: [],
    roles: []
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
    }
};

export default adminReducer;
