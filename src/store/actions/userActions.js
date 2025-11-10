import actionTypes from './actionTypes';
import { handleRegisterApi } from '../../services/userService';

export const addUserSuccess = () => ({
    type: actionTypes.ADD_USER_SUCCESS
})

export const userLoginSuccess = (userInfo) => ({
    type: actionTypes.USER_LOGIN_SUCCESS,
    userInfo: userInfo
})

export const userLoginFail = () => ({
    type: actionTypes.USER_LOGIN_FAIL
})

export const processLogout = () => ({
    type: actionTypes.PROCESS_LOGOUT
})

export const userRegister = (userData) => {
    return async (dispatch) => {
        try {
            const res = await handleRegisterApi(userData);

            // Nếu API trả thẳng data
            const data = res.data || res;

            if (data.errCode === 0) {
                dispatch(userRegisterSuccess());
                return { success: true, message: data.message };
            } else {
                dispatch(userRegisterFail(data.message));
                return { success: false, message: data.message };
            }
        } catch (e) {
            dispatch(userRegisterFail('Server error'));
            return { success: false, message: 'Server error' };
        }
    };
};


export const userRegisterSuccess = () => ({
    type: actionTypes.USER_REGISTER_SUCCESS
})

export const userRegisterFail = (message) => ({
    type: actionTypes.USER_REGISTER_FAIL,
    message
})