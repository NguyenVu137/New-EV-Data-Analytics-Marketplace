import actionTypes from './actionTypes';

export const addUserSuccess = () => ({
    type: actionTypes.ADD_USER_SUCCESS
})

export const userLoginSuccess = (userInfo) => {
    // Save token and userId to localStorage for API calls
    if (userInfo && userInfo.user) {
        // Generate a simple JWT token (in real app, backend should return this)
        const token = btoa(JSON.stringify(userInfo.user));
        localStorage.setItem('authToken', token);
        localStorage.setItem('userId', userInfo.user.id);
        localStorage.setItem('userEmail', userInfo.user.email);
        localStorage.setItem('userRole', userInfo.user.roleId);
    }
    
    return {
        type: actionTypes.USER_LOGIN_SUCCESS,
        userInfo: userInfo
    };
}

export const userLoginFail = () => ({
    type: actionTypes.USER_LOGIN_FAIL
})

export const processLogout = () => {
    // Clear localStorage on logout
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    
    return {
        type: actionTypes.PROCESS_LOGOUT
    };
} 