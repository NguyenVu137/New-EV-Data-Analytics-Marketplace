import actionTypes from './actionTypes';
import {
    getMyPayoutsService,
    getBalanceService,
    requestWithdrawService,
    getWithdrawalHistoryService,
    getPendingPayoutsService,
    processPayoutService,
    getPayoutStatisticsService
} from '../../services/payoutService';

import axios from '../../axios';

//  GET MY PAYOUTS (PROVIDER) 
export const getMyPayouts = (status = null, limit = 50, offset = 0) => {
    return async (dispatch) => {
        dispatch(getMyPayoutsStart());

        try {
            const res = await getMyPayoutsService(status, limit, offset);

            if (res && res.errCode === 0) {
                dispatch(getMyPayoutsSuccess(res));
                return {
                    success: true,
                    data: res.data,
                    total: res.total
                };
            } else {
                dispatch(getMyPayoutsFailed(res.message));
                return { success: false, message: res.message };
            }
        } catch (error) {
            dispatch(getMyPayoutsFailed(error.message));
            console.log('getMyPayouts error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Server error'
            };
        }
    };
};

export const getMyPayoutsStart = () => ({
    type: actionTypes.GET_MY_PAYOUTS_START
});

export const getMyPayoutsSuccess = (data) => ({
    type: actionTypes.GET_MY_PAYOUTS_SUCCESS,
    payload: data
});

export const getMyPayoutsFailed = (error) => ({
    type: actionTypes.GET_MY_PAYOUTS_FAILED,
    payload: error
});

//  GET BALANCE (PROVIDER) 
export const getBalance = () => {
    return async (dispatch) => {
        dispatch(getBalanceStart());

        try {
            const res = await getBalanceService();

            if (res && res.errCode === 0) {
                dispatch(getBalanceSuccess(res.data));
                return { success: true, data: res.data };
            } else {
                dispatch(getBalanceFailed(res.message));
                return { success: false, message: res.message };
            }
        } catch (error) {
            dispatch(getBalanceFailed(error.message));
            console.log('getBalance error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Server error'
            };
        }
    };
};

export const getBalanceStart = () => ({
    type: actionTypes.GET_BALANCE_START
});

export const getBalanceSuccess = (data) => ({
    type: actionTypes.GET_BALANCE_SUCCESS,
    payload: data
});

export const getBalanceFailed = (error) => ({
    type: actionTypes.GET_BALANCE_FAILED,
    payload: error
});

//  REQUEST WITHDRAW (PROVIDER) 
export const requestWithdraw = (payoutIds, bankInfo) => {
    return async (dispatch) => {
        dispatch(requestWithdrawStart());

        try {
            console.log('🟡 Redux action - payoutIds:', payoutIds);
            console.log('🟡 Redux action - bankInfo:', bankInfo);
            const res = await requestWithdrawService(payoutIds, bankInfo);

            if (res && res.errCode === 0) {
                dispatch(requestWithdrawSuccess(res));
                // Refresh payouts list after withdraw
                dispatch(getMyPayouts());
                dispatch(getBalance());
                return { success: true, data: res.data };
            } else {
                dispatch(requestWithdrawFailed(res.message));
                return { success: false, message: res.message };
            }
        } catch (error) {
            dispatch(requestWithdrawFailed(error.message));
            console.log('requestWithdraw error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Server error'
            };
        }
    };
};

export const requestWithdrawStart = () => ({
    type: actionTypes.REQUEST_WITHDRAW_START
});

export const requestWithdrawSuccess = (data) => ({
    type: actionTypes.REQUEST_WITHDRAW_SUCCESS,
    payload: data
});

export const requestWithdrawFailed = (error) => ({
    type: actionTypes.REQUEST_WITHDRAW_FAILED,
    payload: error
});

//  GET WITHDRAWAL HISTORY (PROVIDER) - MỚI
export const getWithdrawalHistory = (limit = 50, offset = 0) => {
    return async (dispatch) => {
        dispatch(getWithdrawalHistoryStart());

        try {
            const res = await axios.get(`/api/transactions/withdrawal-history?limit=${limit}&offset=${offset}`);

            if (res && res.errCode === 0) {
                dispatch(getWithdrawalHistorySuccess(res));
                return {
                    success: true,
                    data: res.data,
                    errCode: 0
                };
            } else {
                dispatch(getWithdrawalHistoryFailed(res.message));
                return { success: false, message: res.message };
            }
        } catch (error) {
            dispatch(getWithdrawalHistoryFailed(error.message));
            console.log('getWithdrawalHistory error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Server error'
            };
        }
    };
};

export const getWithdrawalHistoryStart = () => ({
    type: actionTypes.GET_WITHDRAWAL_HISTORY_START
});

export const getWithdrawalHistorySuccess = (data) => ({
    type: actionTypes.GET_WITHDRAWAL_HISTORY_SUCCESS,
    payload: data
});

export const getWithdrawalHistoryFailed = (error) => ({
    type: actionTypes.GET_WITHDRAWAL_HISTORY_FAILED,
    payload: error
});

//  GET PENDING PAYOUTS (ADMIN) 
export const getPendingPayouts = (limit = 50, offset = 0) => {
    return async (dispatch) => {
        dispatch(getPendingPayoutsStart());

        try {
            const res = await getPendingPayoutsService(limit, offset);

            if (res && res.errCode === 0) {
                dispatch(getPendingPayoutsSuccess(res));
                return {
                    success: true,
                    data: res.data,
                    total: res.total
                };
            } else {
                dispatch(getPendingPayoutsFailed(res.message));
                return { success: false, message: res.message };
            }
        } catch (error) {
            dispatch(getPendingPayoutsFailed(error.message));
            console.log('getPendingPayouts error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Server error'
            };
        }
    };
};

export const getPendingPayoutsStart = () => ({
    type: actionTypes.GET_PENDING_PAYOUTS_START
});

export const getPendingPayoutsSuccess = (data) => ({
    type: actionTypes.GET_PENDING_PAYOUTS_SUCCESS,
    payload: data
});

export const getPendingPayoutsFailed = (error) => ({
    type: actionTypes.GET_PENDING_PAYOUTS_FAILED,
    payload: error
});

//  PROCESS PAYOUT (ADMIN) 
export const processPayout = (payoutId, action, note = '') => {
    return async (dispatch) => {
        dispatch(processPayoutStart());

        try {
            const res = await processPayoutService(payoutId, action, note);

            if (res && res.errCode === 0) {
                dispatch(processPayoutSuccess(res));
                // Refresh pending list after processing
                dispatch(getPendingPayouts());
                return { success: true, data: res.payout };
            } else {
                dispatch(processPayoutFailed(res.message));
                return { success: false, message: res.message };
            }
        } catch (error) {
            dispatch(processPayoutFailed(error.message));
            console.log('processPayout error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Server error'
            };
        }
    };
};

export const processPayoutStart = () => ({
    type: actionTypes.PROCESS_PAYOUT_START
});

export const processPayoutSuccess = (data) => ({
    type: actionTypes.PROCESS_PAYOUT_SUCCESS,
    payload: data
});

export const processPayoutFailed = (error) => ({
    type: actionTypes.PROCESS_PAYOUT_FAILED,
    payload: error
});

//  GET PAYOUT STATISTICS (ADMIN) 
export const getPayoutStatistics = () => {
    return async (dispatch) => {
        dispatch(getPayoutStatisticsStart());

        try {
            const res = await getPayoutStatisticsService();

            if (res && res.errCode === 0) {
                dispatch(getPayoutStatisticsSuccess(res.data));
                return { success: true, data: res.data };
            } else {
                dispatch(getPayoutStatisticsFailed(res.message));
                return { success: false, message: res.message };
            }
        } catch (error) {
            dispatch(getPayoutStatisticsFailed(error.message));
            console.log('getPayoutStatistics error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Server error'
            };
        }
    };
};

export const getPayoutStatisticsStart = () => ({
    type: actionTypes.GET_PAYOUT_STATISTICS_START
});

export const getPayoutStatisticsSuccess = (data) => ({
    type: actionTypes.GET_PAYOUT_STATISTICS_SUCCESS,
    payload: data
});

export const getPayoutStatisticsFailed = (error) => ({
    type: actionTypes.GET_PAYOUT_STATISTICS_FAILED,
    payload: error
});