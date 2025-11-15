import actionTypes from './actionTypes';
import {
    purchaseDatasetService,
    checkDownloadPermissionService,
    getUserPurchasesService,
    getProviderRevenueService
} from '../../services/transactionService';

export const purchaseDataset = (datasetId, packageType, paymentMethod) => {
    return async (dispatch) => {
        dispatch(purchaseDatasetStart());

        try {
            const res = await purchaseDatasetService(datasetId, packageType, paymentMethod);

            if (res && res.errCode === 0) {
                dispatch(purchaseDatasetSuccess(res));
                return { success: true, data: res };
            } else {
                dispatch(purchaseDatasetFailed(res.errMessage || res.message));
                return { success: false, message: res.errMessage || res.message };
            }
        } catch (error) {
            dispatch(purchaseDatasetFailed(error.message));
            console.log('purchaseDataset error:', error);
            return { success: false, message: error.response?.data?.message || 'Server error' };
        }
    };
};

export const purchaseDatasetStart = () => ({
    type: actionTypes.PURCHASE_DATASET_START
});

export const purchaseDatasetSuccess = (data) => ({
    type: actionTypes.PURCHASE_DATASET_SUCCESS,
    payload: data
});

export const purchaseDatasetFailed = (error) => ({
    type: actionTypes.PURCHASE_DATASET_FAILED,
    payload: error
});

export const checkDownloadPermission = (datasetId) => {
    return async (dispatch) => {
        dispatch(checkPermissionStart());

        try {
            const res = await checkDownloadPermissionService(datasetId);

            if (res && res.errCode === 0) {
                dispatch(checkPermissionSuccess(res));
                return { success: true, data: res };
            } else {
                dispatch(checkPermissionFailed(res.message));
                return { success: false, data: res };
            }
        } catch (error) {
            dispatch(checkPermissionFailed(error.message));
            console.log('checkDownloadPermission error:', error);
            return { success: false, message: error.response?.data?.message || 'Server error' };
        }
    };
};

export const checkPermissionStart = () => ({
    type: actionTypes.CHECK_PERMISSION_START
});

export const checkPermissionSuccess = (data) => ({
    type: actionTypes.CHECK_PERMISSION_SUCCESS,
    payload: data
});

export const checkPermissionFailed = (error) => ({
    type: actionTypes.CHECK_PERMISSION_FAILED,
    payload: error
});

export const getUserPurchases = () => {
    return async (dispatch) => {
        dispatch(getPurchasesStart());

        try {
            const res = await getUserPurchasesService();

            if (res && res.errCode === 0) {
                dispatch(getPurchasesSuccess(res.data));
                return { success: true, data: res.data };
            } else {
                dispatch(getPurchasesFailed(res.message));
                return { success: false, message: res.message };
            }
        } catch (error) {
            dispatch(getPurchasesFailed(error.message));
            console.log('getUserPurchases error:', error);
            return { success: false, message: error.response?.data?.message || 'Server error' };
        }
    };
};

export const getPurchasesStart = () => ({
    type: actionTypes.GET_PURCHASES_START
});

export const getPurchasesSuccess = (data) => ({
    type: actionTypes.GET_PURCHASES_SUCCESS,
    payload: data
});

export const getPurchasesFailed = (error) => ({
    type: actionTypes.GET_PURCHASES_FAILED,
    payload: error
});

export const getProviderRevenue = () => {
    return async (dispatch) => {
        dispatch(getRevenueStart());

        try {
            const res = await getProviderRevenueService();

            if (res && res.errCode === 0) {
                dispatch(getRevenueSuccess(res.revenue));
                return { success: true, revenue: res.revenue };
            } else {
                dispatch(getRevenueFailed(res.message));
                return { success: false, message: res.message };
            }
        } catch (error) {
            dispatch(getRevenueFailed(error.message));
            console.log('getProviderRevenue error:', error);
            return { success: false, message: error.response?.data?.message || 'Server error' };
        }
    };
};

export const getRevenueStart = () => ({
    type: actionTypes.GET_REVENUE_START
});

export const getRevenueSuccess = (revenue) => ({
    type: actionTypes.GET_REVENUE_SUCCESS,
    payload: revenue
});

export const getRevenueFailed = (error) => ({
    type: actionTypes.GET_REVENUE_FAILED,
    payload: error
});