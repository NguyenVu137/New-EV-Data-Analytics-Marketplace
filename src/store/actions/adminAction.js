import actionTypes from './actionTypes';
import { getAllCodeService, createNewUserService, getAllUsers, deleteUserService, editUserService } from '../../services/userService';

// Gender
export const fetchGenderStart = () => {
    return async (dispatch) => {
        try {
            dispatch({ type: actionTypes.FETCH_GENDER_START });

            let res = await getAllCodeService("GENDER");
            if (res && res.errCode === 0) {
                dispatch(fetchGenderSuccess(res.data));
            } else {
                dispatch(fetchGenderFailed());
            }
        } catch (e) {
            dispatch(fetchGenderFailed());
            console.log('fetchGenderStart error ', e);
        }
    }
}

export const fetchGenderSuccess = (genderData) => ({
    type: actionTypes.FETCH_GENDER_SUCCESS,
    data: genderData
});

export const fetchGenderFailed = () => ({
    type: actionTypes.FETCH_GENDER_FAILED
});

// Role
export const fetchRoleStart = () => {
    return async (dispatch) => {
        try {
            let res = await getAllCodeService("ROLE");
            if (res && res.errCode === 0) {
                dispatch(fetchRoleSuccess(res.data))
            } else {
                dispatch(fetchRoleFailed());
            }
        } catch (e) {
            dispatch(fetchRoleFailed());
            console.log('fetchRoleStart error', e);
        }
    }
}

export const fetchRoleSuccess = (roleData) => ({
    type: actionTypes.FETCH_ROLE_SUCCESS,
    data: roleData
});

export const fetchRoleFailed = () => ({
    type: actionTypes.FETCH_ROLE_FAILED,
});

// Create User
export const createNewUser = (data) => {
    return async (dispatch) => {
        try {
            let res = await createNewUserService(data);
            console.log('check create user redux: ', res);

            if (res && res.errCode === 0) {
                dispatch(saveUserSuccess());
                return { success: true, message: res.errMessage || 'User created successfully' };
            } else {
                dispatch(saveUserFailed());
                return { success: false, message: res?.errMessage || 'Failed to create user' };
            }
        } catch (e) {
            dispatch(saveUserFailed());
            console.log('saveUserFailed error', e);
            return { success: false, message: 'Server error' };
        }
    }
}

export const saveUserSuccess = () => ({
    type: 'CREATE_USER_SUCCESS'
})

export const saveUserFailed = () => ({
    type: 'CREATE_USER_FAILED'
})

// Fetch all users
export const fetchAllUsersStart = () => {
    return async (dispatch) => {
        try {
            let res = await getAllUsers();
            if (res && res.errCode === 0) {
                dispatch(fetchAllUsersSuccess(res.users.reverse()));
                return { success: true, data: res.users };
            } else {
                dispatch(fetchAllUsersFailed());
                return { success: false, message: res?.errMessage || 'Failed to fetch users' };
            }
        } catch (e) {
            dispatch(fetchAllUsersFailed());
            console.log('fetchAllUsersFailed error', e);
            return { success: false, message: 'Server error' };
        }
    }
}

export const fetchAllUsersSuccess = (data) => ({
    type: actionTypes.FETCH_ALL_USERS_SUCCESS,
    users: data
})

export const fetchAllUsersFailed = () => ({
    type: actionTypes.FETCH_ALL_USERS_FAILED
})

// Delete user
export const deleteUser = (userId) => {
    return async (dispatch) => {
        try {
            let res = await deleteUserService(userId);
            if (res && res.errCode === 0) {
                dispatch(deleteUserSuccess());
                await dispatch(fetchAllUsersStart());
                return { success: true, message: res.errMessage || 'User deleted successfully' };
            } else {
                dispatch(deleteUserFailed());
                return { success: false, message: res?.errMessage || 'Failed to delete user' };
            }
        } catch (e) {
            dispatch(deleteUserFailed());
            console.log('deleteUserFailed error', e);
            return { success: false, message: 'Server error' };
        }
    }
}

export const deleteUserSuccess = () => ({
    type: 'DELETE_USER_SUCCESS'
})

export const deleteUserFailed = () => ({
    type: 'DELETE_USER_FAILED'
})

// Edit user
export const editUser = (data) => {
    return async (dispatch) => {
        try {
            let res = await editUserService(data);
            if (res && res.errCode === 0) {
                dispatch(editUserSuccess());
                await dispatch(fetchAllUsersStart());
                return { success: true, message: res.errMessage || 'User updated successfully' };
            } else {
                dispatch(editUserFailed());
                return { success: false, message: res?.errMessage || 'Failed to update user' };
            }
        } catch (e) {
            dispatch(editUserFailed());
            console.log('editUserFailed error', e);
            return { success: false, message: 'Server error' };
        }
    }
}

export const editUserSuccess = () => ({
    type: 'EDIT_USER_SUCCESS'
})

export const editUserFailed = () => ({
    type: 'EDIT_USER_FAILED'
})
