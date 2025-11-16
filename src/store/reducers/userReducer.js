import actionTypes from '../actions/actionTypes';

const initialState = {
    isLoggedIn: false,
    userInfo: null
}

const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.USER_LOGIN_SUCCESS:
            // Save userId to localStorage for payment API calls
            if (action.userInfo && action.userInfo.user && action.userInfo.user.id) {
                localStorage.setItem('userId', action.userInfo.user.id);
            }
            return {
                ...state,
                isLoggedIn: true,
                userInfo: action.userInfo
            }
        case actionTypes.USER_LOGIN_FAIL:
            localStorage.removeItem('userId');
            return {
                ...state,
                isLoggedIn: false,
                userInfo: null
            } 
        case actionTypes.PROCESS_LOGOUT:
            localStorage.removeItem('userId');
            return {
                ...state,
                isLoggedIn: false,
                userInfo: null
            }
        default:
            // Ensure isLoggedIn is synced with userInfo (fix Redux-persist restore issues)
            if (state.userInfo && state.userInfo.user && !state.isLoggedIn) {
                return {
                    ...state,
                    isLoggedIn: true
                };
            }
            // If no userInfo but isLoggedIn is true, set to false
            if (!state.userInfo && state.isLoggedIn) {
                return {
                    ...state,
                    isLoggedIn: false
                };
            }
            return state;
    }
}

export default userReducer;