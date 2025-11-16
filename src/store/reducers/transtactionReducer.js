import actionTypes from '../actions/actionTypes';

const initialState = {
    // Create Transaction
    isCreatingTransaction: false,
    currentTransaction: null,
    paymentUrl: null,
    createError: null,

    // Simulate Payment
    isSimulating: false,
    simulateError: null,

    // Permission
    isCheckingPermission: false,
    downloadPermission: null,
    permissionError: null,

    // Purchases history
    isLoadingPurchases: false,
    userPurchases: [],
    purchasesError: null,

    // Transaction history
    isLoadingHistory: false,
    transactions: [],
    transactionTotal: 0,
    historyError: null,

    // UI
    showPaymentModal: false
};

const transactionReducer = (state = initialState, action) => {
    switch (action.type) {
        //  CREATE TRANSACTION 
        case actionTypes.CREATE_TRANSACTION_START:
            return {
                ...state,
                isCreatingTransaction: true,
                createError: null,
                currentTransaction: null
            };

        case actionTypes.CREATE_TRANSACTION_SUCCESS:
            return {
                ...state,
                isCreatingTransaction: false,
                currentTransaction: action.payload.transaction,
                paymentUrl: action.payload.paymentUrl,
                showPaymentModal: true,
                createError: null
            };

        case actionTypes.CREATE_TRANSACTION_FAILED:
            return {
                ...state,
                isCreatingTransaction: false,
                currentTransaction: null,
                createError: action.payload
            };

        //  SIMULATE PAYMENT 
        case actionTypes.SIMULATE_PAYMENT_START:
            return {
                ...state,
                isSimulating: true,
                simulateError: null
            };

        case actionTypes.SIMULATE_PAYMENT_SUCCESS:
            return {
                ...state,
                isSimulating: false,
                showPaymentModal: false,
                simulateError: null
            };

        case actionTypes.SIMULATE_PAYMENT_FAILED:
            return {
                ...state,
                isSimulating: false,
                simulateError: action.payload
            };

        //  CHECK PERMISSION 
        case actionTypes.CHECK_PERMISSION_START:
            return {
                ...state,
                isCheckingPermission: true,
                permissionError: null
            };

        case actionTypes.CHECK_PERMISSION_SUCCESS:
            return {
                ...state,
                isCheckingPermission: false,
                downloadPermission: action.payload,
                permissionError: null
            };

        case actionTypes.CHECK_PERMISSION_FAILED:
            return {
                ...state,
                isCheckingPermission: false,
                downloadPermission: null,
                permissionError: action.payload
            };

        //  GET PURCHASES 
        case actionTypes.GET_PURCHASES_START:
            return {
                ...state,
                isLoadingPurchases: true,
                purchasesError: null
            };

        case actionTypes.GET_PURCHASES_SUCCESS:
            return {
                ...state,
                isLoadingPurchases: false,
                userPurchases: action.payload,
                purchasesError: null
            };

        case actionTypes.GET_PURCHASES_FAILED:
            return {
                ...state,
                isLoadingPurchases: false,
                userPurchases: [],
                purchasesError: action.payload
            };

        //  GET TRANSACTION HISTORY 
        case actionTypes.GET_TRANSACTION_HISTORY_START:
            return {
                ...state,
                isLoadingHistory: true,
                historyError: null
            };

        case actionTypes.GET_TRANSACTION_HISTORY_SUCCESS:
            return {
                ...state,
                isLoadingHistory: false,
                transactions: action.payload.data || [],
                transactionTotal: action.payload.total || 0,
                historyError: null
            };

        case actionTypes.GET_TRANSACTION_HISTORY_FAILED:
            return {
                ...state,
                isLoadingHistory: false,
                transactions: [],
                historyError: action.payload
            };

        default:
            return state;
    }
};

export default transactionReducer;