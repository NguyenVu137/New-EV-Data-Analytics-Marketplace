import axios from '../axios';

//  PAYOUT SERVICES 

/**
 * Get my payouts - Lấy danh sách payouts của provider
 */
const getMyPayoutsService = (status = null, limit = 50, offset = 0) => {
    let url = `/api/transactions/my-payouts?limit=${limit}&offset=${offset}`;
    if (status) url += `&status=${status}`;
    return axios.get(url);
};

/**
 * Get balance - Lấy số dư của provider
 */
const getBalanceService = () => {
    return axios.get('/api/transactions/balance');
};

/**
 * Request withdraw - Yêu cầu rút tiền
 */
const requestWithdrawService = (payoutIds, bankInfo) => {
    console.log('🟢 Service received - payoutIds:', payoutIds);
    console.log('🟢 Service received - bankInfo:', bankInfo);

    const payload = {
        payoutIds: payoutIds,
        bankInfo: bankInfo
    };

    console.log('🟢 Service sending payload:', payload);
    console.log('🟢 Payload JSON:', JSON.stringify(payload));

    return axios.post('/api/transactions/withdraw', payload);
};

/**
 * Get withdrawal history - Lấy lịch sử rút tiền
 */
const getWithdrawalHistoryService = (limit = 50, offset = 0) => {
    return axios.get(`/api/transactions/withdrawal-history?limit=${limit}&offset=${offset}`);
};

/**
 * Get payout history
 */
const getPayoutHistoryService = (limit = 20, offset = 0) => {
    return axios.get(`/api/transactions/my-payouts?limit=${limit}&offset=${offset}`);
};

//  ADMIN PAYOUT SERVICES 

/**
 * Get pending payouts
 */
const getPendingPayoutsService = (limit = 50, offset = 0) => {
    return axios.get(`/api/transactions/payouts/pending?limit=${limit}&offset=${offset}`);
};

/**
 * Process payout
 */
const processPayoutService = (payoutId, action, adminNote = '') => {
    return axios.post(`/api/transactions/payouts/${payoutId}/process`, {
        action,
        admin_note: adminNote
    });
};

/**
 * Get payout statistics
 */
const getPayoutStatisticsService = () => {
    return axios.get('/api/transactions/payouts/statistics');
};

/**
 * Get all payouts
 */
const getAllPayoutsService = (filters = {}, limit = 50, offset = 0) => {
    let url = `/api/transactions/payouts?limit=${limit}&offset=${offset}`;
    if (filters.status) url += `&status=${filters.status}`;
    if (filters.providerId) url += `&providerId=${filters.providerId}`;
    return axios.get(url);
};

const getProviderRevenueService = getBalanceService;

export {
    getMyPayoutsService,
    getBalanceService,
    requestWithdrawService,
    getPayoutHistoryService,
    getWithdrawalHistoryService,
    getPendingPayoutsService,
    processPayoutService,
    getPayoutStatisticsService,
    getAllPayoutsService,
    getProviderRevenueService
};
