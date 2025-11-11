import actionTypes from './actionTypes';
import {
    getAllCodeService, createNewUserService,
    getAllUsers, deleteUserService, editUserService,
    getTopDataHomeService, getAllDatas, saveDetailDataService
} from '../../services/userService';
import { toast } from "react-toastify";

// export const fetchGenderStart = () => ({
//     type: actionTypes.FETCH_GENDER_START
// })

export const fetchGenderStart = () => {
    return async (dispatch, getState) => {
        try {
            dispatch({
                type: actionTypes.FETCH_GENDER_START
            })

            let res = await getAllCodeService("GENDER");
            if (res && res.errCode === 0) {
                dispatch(fetchGenderSuccess(res.data));
            } else {
                dispatch(fetchGenderFailed());
            }
        } catch (e) {
            dispatch(fetchGenderFailed());
            console.log('fetchGenderStart error ', e)
        }
    }
}

export const fetchGenderSuccess = (genderData) => ({
    type: actionTypes.FETCH_GENDER_SUCCESS,
    data: genderData
})

export const fetchGenderFailed = () => ({
    type: actionTypes.FETCH_GENDER_FAILED
})

export const fetchPositionSuccess = (positionData) => ({
    type: actionTypes.FETCH_POSITION_SUCCESS,
    data: positionData
})

export const fetchPositionFailed = (positionData) => ({
    type: actionTypes.FETCH_POSITION_SUCCESS,
})

export const fetchRoleSuccess = (roleData) => ({
    type: actionTypes.FETCH_ROLE_SUCCESS,
    data: roleData
})

export const fetchRoleFailed = (roleData) => ({
    type: actionTypes.FETCH_ROLE_Failed,
})

export const fetchPositionStart = () => {
    return async (dispatch, getState) => {
        try {
            dispatch({
                type: actionTypes.FETCH_GENDER_START
            })
            let res = await getAllCodeService("POSITION");
            if (res && res.errCode === 0) {
                dispatch(fetchPositionSuccess(res.data))
            } else {
                dispatch(fetchPositionFailed());
            }
        } catch (e) {
            dispatch(fetchPositionFailed());
            console.log('fetchPositionFailed error', e)
        }
    }
}

export const fetchRoleStart = () => {
    return async (dispatch, getState) => {
        try {
            let res = await getAllCodeService("ROLE");
            if (res && res.errCode === 0) {
                dispatch(fetchRoleSuccess(res.data))
            } else {
                dispatch(fetchRoleFailed());
            }
        } catch (e) {
            dispatch(fetchRoleFailed());
            console.log('fetchRoleFailed error', e)
        }
    }
}

export const createNewUser = (data) => {
    return async (dispatch, getState) => {
        try {
            let res = await createNewUserService(data);
            if (res && res.errCode === 0) {
                toast.success("Create a new user succeed!")
                dispatch(saveUserSuccess(res.data));
                await dispatch(fetchAllUsersStart());
            } else {
                dispatch(saveUserFailed());
            }
        } catch (e) {
            dispatch(saveUserFailed());
            console.log('saveUserFailed error', e)
        }
    }
}

export const saveUserSuccess = () => ({
    type: actionTypes.CREATE_USER_SUCCESS
})

export const saveUserFailed = () => ({
    type: actionTypes.CREATE_USER_FAILED
})

export const fetchAllUsersStart = () => {
    return async (dispatch, getState) => {
        try {
            let res = await getAllUsers("ALL");
            if (res && res.errCode === 0) {
                dispatch(fetchAllUsersSuccess(res.users.reverse()));
            } else {
                toast.error("Fetch all users error!")
                dispatch(fetchAllUsersFailed());
            }
        } catch (e) {
            toast.error("Fetch all users error!")
            dispatch(fetchAllUsersFailed());
            console.log('fetchAllUsersFailed error', e)
        }
    }
}

export const fetchAllUsersSuccess = (data) => ({
    type: actionTypes.FETCH_ALL_USERS_SUCCESS,
    users: data
})

export const fetchAllUsersFailed = (data) => ({
    type: actionTypes.FETCH_ALL_USERS_FAILED
})

export const deleteUser = (userId) => {
    return async (dispatch, getState) => {
        try {
            let res = await deleteUserService(userId);
            if (res && res.errCode === 0) {
                toast.success("Delete user succeed!")
                dispatch(saveUserSuccess(res.data));
                await dispatch(fetchAllUsersStart());
            } else {
                toast.error("Delete user error!")
                dispatch(saveUserFailed());
            }
        } catch (e) {
            toast.error("Delete user error!")
            dispatch(saveUserFailed());
            console.log('saveUserFailed error', e)
        }
    }
}

export const deleteUserSuccess = () => ({
    type: actionTypes.FETCH_ALL_USERS_SUCCESS
})

export const deleteUserFailed = () => ({
    type: actionTypes.FETCH_ALL_USERS_FAILED
})

export const editUser = (data) => {
    return async (dispatch, getState) => {
        try {
            let res = await editUserService(data);
            console.log(res, res.errCode)
            if (res && res.errCode === 0) {
                toast.success("Update user succeed!")
                dispatch(editUserSuccess());
                dispatch(fetchAllUsersStart());
            } else {
                toast.error("Update user error!")
                dispatch(editUserFailed());
            }
        } catch (e) {
            toast.error("Update user error!")
            dispatch(editUserFailed());
            console.log('editUserFailed error', e)
        }
    }
}

export const editUserSuccess = () => ({
    type: actionTypes.EDIT_USER_SUCCESS
})

export const editUserFailed = () => ({
    type: actionTypes.EDIT_USER_FAILED
})

export const fetchTopData = () => {
    return async (dispatch, getState) => {
        try {
            let res = await getTopDataHomeService('');
            if (res && res.errCode === 0) {
                dispatch({
                    type: actionTypes.FETCH_TOP_DATAS_SUCCESS,
                    datas: res.data
                })
            } else {
                dispatch({
                    type: actionTypes.FETCH_TOP_DATAS_FAILED
                })
            }
        } catch (e) {
            console.log('FETCH_TOP_DATAS_FAILED: ', e)
            dispatch({
                type: actionTypes.FETCH_TOP_DATAS_FAILED
            })
        }
    }
}

export const fetchAllDatas = () => {
    return async (dispatch, getState) => {
        try {
            let res = await getAllDatas();
            if (res && res.errCode === 0) {
                dispatch({
                    type: actionTypes.FETCH_ALL_DATAS_SUCCESS,
                    datas: res.data
                })
            } else {
                dispatch({
                    type: actionTypes.FETCH_ALL_DATAS_FAILED
                })
            }
        } catch (e) {
            console.log('FETCH_TOP_DATAS_FAILED: ', e)
            dispatch({
                type: actionTypes.FETCH_ALL_DATAS_FAILED
            })
        }
    }
}

export const saveDetailData = (data) => {
    return async (dispatch, getState) => {
        try {
            let res = await saveDetailDataService(data);
            if (res && res.errCode === 0) {
                toast.success("Save infor detail data succeed!")
                dispatch({
                    type: actionTypes.SAVE_DETAIL_DATA_SUCCESS,
                })
            } else {
                console.log('error res', res)
                toast.error("Save infor detail data failed!")
                dispatch({
                    type: actionTypes.SAVE_DETAIL_DATA_FAILED
                })
            }
        } catch (e) {
            toast.error("Save infor detail data failed!")
            console.log('SAVE_DETAIL_DATA_FAILED: ', e)
            dispatch({
                type: actionTypes.SAVE_DETAIL_DATA_FAILED
            })
        }
    }
}