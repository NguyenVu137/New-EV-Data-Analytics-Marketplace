import actionTypes from '../actions/actionTypes';

const initialState = {
    // My Payouts (Provider)
    isLoadingPayouts: false,
    myPayouts: [],
    payoutsTotal: 0,
    payoutsError: null,

    // Balance (Provider)
    isLoadingBalance: false,
    balance: {
        available: 0,
        pending: 0,
        completed: 0,
        total: 0
    },
    balanceError: null,

    // Withdraw Request (Provider)
    isWithdrawing: false,
    withdrawResult: null,
    withdrawError: null,

    // Pending Payouts (Admin)
    isLoadingPending: false,
    pendingPayouts: [],
    pendingTotal: 0,
    pendingError: null,

    // Process Payout (Admin)
    isProcessing: false,
    processResult: null,
    processError: null,

    // Statistics (Admin)
    isLoadingStats: false,
    statistics: null,
    statsError: null,

    // UI
    showWithdrawModal: false,
    selectedPayouts: []
};

const payoutReducer = (state = initialState, action) => {
    switch (action.type) {
        //  GET MY PAYOUTS 
        case actionTypes.GET_MY_PAYOUTS_START:
            return {
                ...state,
                isLoadingPayouts: true,
                payoutsError: null
            };

        case actionTypes.GET_MY_PAYOUTS_SUCCESS:
            return {
                ...state,
                isLoadingPayouts: false,
                myPayouts: action.payload.data || [],
                payoutsTotal: action.payload.total || 0,
                payoutsError: null
            };

        case actionTypes.GET_MY_PAYOUTS_FAILED:
            return {
                ...state,
                isLoadingPayouts: false,
                myPayouts: [],
                payoutsError: action.payload
            };

        //  GET BALANCE 
        case actionTypes.GET_BALANCE_START:
            return {
                ...state,
                isLoadingBalance: true,
                balanceError: null
            };

        case actionTypes.GET_BALANCE_SUCCESS:
            return {
                ...state,
                isLoadingBalance: false,
                balance: action.payload,
                balanceError: null
            };

        case actionTypes.GET_BALANCE_FAILED:
            return {
                ...state,
                isLoadingBalance: false,
                balance: {
                    available: 0,
                    pending: 0,
                    completed: 0,
                    total: 0
                },
                balanceError: action.payload
            };

        //  REQUEST WITHDRAW 
        case actionTypes.REQUEST_WITHDRAW_START:
            return {
                ...state,
                isWithdrawing: true,
                withdrawError: null,
                withdrawResult: null
            };

        case actionTypes.REQUEST_WITHDRAW_SUCCESS:
            return {
                ...state,
                isWithdrawing: false,
                withdrawResult: action.payload,
                showWithdrawModal: false,
                selectedPayouts: [],
                withdrawError: null
            };

        case actionTypes.REQUEST_WITHDRAW_FAILED:
            return {
                ...state,
                isWithdrawing: false,
                withdrawResult: null,
                withdrawError: action.payload
            };

        //  GET PENDING PAYOUTS (ADMIN) 
        case actionTypes.GET_PENDING_PAYOUTS_START:
            return {
                ...state,
                isLoadingPending: true,
                pendingError: null
            };

        case actionTypes.GET_PENDING_PAYOUTS_SUCCESS:
            return {
                ...state,
                isLoadingPending: false,
                pendingPayouts: action.payload.data || [],
                pendingTotal: action.payload.total || 0,
                pendingError: null
            };

        case actionTypes.GET_PENDING_PAYOUTS_FAILED:
            return {
                ...state,
                isLoadingPending: false,
                pendingPayouts: [],
                pendingError: action.payload
            };

        //  PROCESS PAYOUT (ADMIN) 
        case actionTypes.PROCESS_PAYOUT_START:
            return {
                ...state,
                isProcessing: true,
                processError: null,
                processResult: null
            };

        case actionTypes.PROCESS_PAYOUT_SUCCESS:
            return {
                ...state,
                isProcessing: false,
                processResult: action.payload,
                processError: null
            };

        case actionTypes.PROCESS_PAYOUT_FAILED:
            return {
                ...state,
                isProcessing: false,
                processResult: null,
                processError: action.payload
            };

        //  GET STATISTICS (ADMIN) 
        case actionTypes.GET_PAYOUT_STATISTICS_START:
            return {
                ...state,
                isLoadingStats: true,
                statsError: null
            };

        case actionTypes.GET_PAYOUT_STATISTICS_SUCCESS:
            return {
                ...state,
                isLoadingStats: false,
                statistics: action.payload,
                statsError: null
            };

        case actionTypes.GET_PAYOUT_STATISTICS_FAILED:
            return {
                ...state,
                isLoadingStats: false,
                statistics: null,
                statsError: action.payload
            };

        default:
            return state;
    }
};

export default payoutReducer;