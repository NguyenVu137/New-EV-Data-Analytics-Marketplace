const initialState = {
    // Purchase
    isPurchasing: false,
    purchaseSuccess: null,
    purchaseError: null,

    // Permission
    isCheckingPermission: false,
    downloadPermission: null,
    permissionError: null,

    // Purchases history
    isLoadingPurchases: false,
    userPurchases: [],
    purchasesError: null,

    // Revenue (for provider)
    isLoadingRevenue: false,
    providerRevenue: 0,
    revenueError: null
};

const transactionReducer = (state = initialState, action) => {
    switch (action.type) {
        // ==================== PURCHASE DATASET ====================
        case 'PURCHASE_DATASET_START':
            return {
                ...state,
                isPurchasing: true,
                purchaseSuccess: null,
                purchaseError: null
            };

        case 'PURCHASE_DATASET_SUCCESS':
            return {
                ...state,
                isPurchasing: false,
                purchaseSuccess: action.payload,
                purchaseError: null
            };

        case 'PURCHASE_DATASET_FAILED':
            return {
                ...state,
                isPurchasing: false,
                purchaseSuccess: null,
                purchaseError: action.payload
            };

        // ==================== CHECK PERMISSION ====================
        case 'CHECK_PERMISSION_START':
            return {
                ...state,
                isCheckingPermission: true,
                permissionError: null
            };

        case 'CHECK_PERMISSION_SUCCESS':
            return {
                ...state,
                isCheckingPermission: false,
                downloadPermission: action.payload,
                permissionError: null
            };

        case 'CHECK_PERMISSION_FAILED':
            return {
                ...state,
                isCheckingPermission: false,
                downloadPermission: null,
                permissionError: action.payload
            };

        // ==================== GET PURCHASES ====================
        case 'GET_PURCHASES_START':
            return {
                ...state,
                isLoadingPurchases: true,
                purchasesError: null
            };

        case 'GET_PURCHASES_SUCCESS':
            return {
                ...state,
                isLoadingPurchases: false,
                userPurchases: action.payload,
                purchasesError: null
            };

        case 'GET_PURCHASES_FAILED':
            return {
                ...state,
                isLoadingPurchases: false,
                userPurchases: [],
                purchasesError: action.payload
            };

        // ==================== GET REVENUE ====================
        case 'GET_REVENUE_START':
            return {
                ...state,
                isLoadingRevenue: true,
                revenueError: null
            };

        case 'GET_REVENUE_SUCCESS':
            return {
                ...state,
                isLoadingRevenue: false,
                providerRevenue: action.payload,
                revenueError: null
            };

        case 'GET_REVENUE_FAILED':
            return {
                ...state,
                isLoadingRevenue: false,
                providerRevenue: 0,
                revenueError: action.payload
            };

        default:
            return state;
    }
};

export default transactionReducer;