import actionTypes from './actionTypes';
import {
    createTransactionService,
    simulatePaymentService,
    checkDownloadPermissionService,
    getUserPurchasesService,
    getUserTransactionsService
} from '../../services/transactionService';

//  CREATE TRANSACTION (MUA DATASET) 
export const createTransaction = (datasetId, packageType, paymentMethod) => {
    return async (dispatch) => {
        dispatch(createTransactionStart());

        try {
            const res = await createTransactionService(datasetId, packageType, paymentMethod);

            if (res && res.errCode === 0) {
                dispatch(createTransactionSuccess(res));
                return res; // Trả về toàn bộ response từ backend
            } else {
                dispatch(createTransactionFailed(res.message || 'Tạo giao dịch thất bại'));
                return res;
            }
        } catch (error) {
            dispatch(createTransactionFailed(error.message));
            console.log('createTransaction error:', error);
            return {
                errCode: -1,
                message: error.message
            };
        }
    };
};

export const createTransactionStart = () => ({
    type: actionTypes.CREATE_TRANSACTION_START
});

export const createTransactionSuccess = (data) => ({
    type: actionTypes.CREATE_TRANSACTION_SUCCESS,
    payload: data
});

export const createTransactionFailed = (error) => ({
    type: actionTypes.CREATE_TRANSACTION_FAILED,
    payload: error
});

//  SIMULATE PAYMENT (DEV ONLY) 
export const simulatePayment = (transactionId, status = 'success') => {
    return async (dispatch) => {
        dispatch(simulatePaymentStart());

        try {
            const res = await simulatePaymentService(transactionId, status);

            if (res && res.errCode === 0) {
                dispatch(simulatePaymentSuccess(res));
                return { success: true, data: res };
            } else {
                dispatch(simulatePaymentFailed(res.message || 'Thanh toán thất bại'));
                return { success: false, message: res.message };
            }
        } catch (error) {
            dispatch(simulatePaymentFailed(error.message));
            console.log('simulatePayment error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Server error'
            };
        }
    };
};

export const simulatePaymentStart = () => ({
    type: actionTypes.SIMULATE_PAYMENT_START
});

export const simulatePaymentSuccess = (data) => ({
    type: actionTypes.SIMULATE_PAYMENT_SUCCESS,
    payload: data
});

export const simulatePaymentFailed = (error) => ({
    type: actionTypes.SIMULATE_PAYMENT_FAILED,
    payload: error
});

//  CHECK DOWNLOAD PERMISSION 
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
            return {
                success: false,
                message: error.response?.data?.message || 'Server error'
            };
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

//  GET USER PURCHASES 
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
            return {
                success: false,
                message: error.response?.data?.message || 'Server error'
            };
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

//  GET TRANSACTION HISTORY 
export const getUserTransactions = (limit = 20, offset = 0) => {
    return async (dispatch) => {
        dispatch(getTransactionHistoryStart());

        try {
            const res = await getUserTransactionsService(limit, offset);

            if (res && res.errCode === 0) {
                dispatch(getTransactionHistorySuccess(res));
                return { success: true, data: res.data, total: res.total };
            } else {
                dispatch(getTransactionHistoryFailed(res.message));
                return { success: false, message: res.message };
            }
        } catch (error) {
            dispatch(getTransactionHistoryFailed(error.message));
            console.log('getUserTransactions error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Server error'
            };
        }
    };
};

export const getTransactionHistoryStart = () => ({
    type: actionTypes.GET_TRANSACTION_HISTORY_START
});

export const getTransactionHistorySuccess = (data) => ({
    type: actionTypes.GET_TRANSACTION_HISTORY_SUCCESS,
    payload: data
});

export const getTransactionHistoryFailed = (error) => ({
    type: actionTypes.GET_TRANSACTION_HISTORY_FAILED,
    payload: error
});

//  BACKWARDS COMPATIBILITY 
// Keep old function name
export const purchaseDataset = createTransaction;