import axios from '../axios';

//  TRANSACTION SERVICES 

// Tạo transaction (mua dataset) - CẬP NHẬT endpoint
const createTransactionService = (datasetId, packageType, paymentMethod) => {
    return axios.post('/api/transactions/create', {
        datasetId,
        packageType,
        paymentMethod
    });
};

// Simulate payment (dev only)
const simulatePaymentService = (transactionId, status = 'success') => {
    return axios.post(`/api/transactions/simulate/${transactionId}`, {
        status
    });
};

// Check download permission
const checkDownloadPermissionService = (datasetId) => {
    return axios.get(`/api/transactions/check-permission/${datasetId}`);
};

// Get user purchases
const getUserPurchasesService = () => {
    return axios.get('/api/transactions/purchases');
};

// Get transaction history
const getUserTransactionsService = (limit = 20, offset = 0) => {
    return axios.get(`/api/transactions/history?limit=${limit}&offset=${offset}`);
};

//  PAYOUT SERVICES 

// Get my payouts (Provider)
const getMyPayoutsService = (status = null, limit = 50, offset = 0) => {
    let url = `/api/payout/my-payouts?limit=${limit}&offset=${offset}`;
    if (status) url += `&status=${status}`;
    return axios.get(url);
};

// Get balance (Provider)
const getBalanceService = () => {
    return axios.get('/api/payout/balance');
};

// Request withdraw (Provider)
const requestWithdrawService = (payoutIds, bankInfo) => {
    return axios.post('/api/payout/withdraw', {
        payoutIds,
        bankInfo
    });
};

// Get pending payouts (Admin)
const getPendingPayoutsService = (limit = 50, offset = 0) => {
    return axios.get(`/api/payout/admin/pending?limit=${limit}&offset=${offset}`);
};

// Process payout (Admin)
const processPayoutService = (payoutId, action, note) => {
    return axios.post(`/api/payout/admin/process/${payoutId}`, {
        action,
        note
    });
};

// Get payout statistics (Admin)
const getPayoutStatisticsService = () => {
    return axios.get('/api/payout/admin/statistics');
};

//  BACKWARDS COMPATIBILITY 
// Keep old names for existing code
const purchaseDatasetService = createTransactionService;
const getProviderRevenueService = getBalanceService;

export {
    // Transaction
    createTransactionService,
    simulatePaymentService,
    checkDownloadPermissionService,
    getUserPurchasesService,
    getUserTransactionsService,

    // Payout
    getMyPayoutsService,
    getBalanceService,
    requestWithdrawService,
    getPendingPayoutsService,
    processPayoutService,
    getPayoutStatisticsService,

    // Backwards compatibility
    purchaseDatasetService,
    getProviderRevenueService
};