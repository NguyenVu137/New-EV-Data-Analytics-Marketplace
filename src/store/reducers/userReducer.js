import actionTypes from '../actions/actionTypes';

const initialState = {
    isLoggedIn: false,
    userInfo: null
};

const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.USER_LOGIN_SUCCESS:
            return {
                ...state,
                isLoggedIn: true,
                userInfo: action.userInfo
            };

        case actionTypes.USER_LOGIN_FAIL:
            return {
                ...state,
                isLoggedIn: false,
                userInfo: null
            };

        case actionTypes.PROCESS_LOGOUT:
            return {
                ...state,
                isLoggedIn: false,
                userInfo: null
            };

        case actionTypes.USER_REGISTER_SUCCESS:
            return {
                ...state,
                registerMessage: 'Đăng ký thành công!'
            }

        case actionTypes.USER_REGISTER_FAIL:
            return {
                ...state,
                registerMessage: action.message
            }

        default:
            return state
    }
};

export default userReducer;
