import axios from '../axios';

//  PAYOUT SERVICES 

/**
 * Get my payouts - Lấy danh sách payouts của provider
 * @param {string|null} status - Filter by status (available, pending, completed, withdrawn)
 * @param {number} limit - Số lượng records
 * @param {number} offset - Vị trí bắt đầu
 */
const getMyPayoutsService = (status = null, limit = 50, offset = 0) => {
    let url = `/api/payout/my-payouts?limit=${limit}&offset=${offset}`;
    if (status) url += `&status=${status}`;
    return axios.get(url);
};

/**
 * Get balance - Lấy số dư của provider
 * @returns {Promise} Balance information (available, pending, completed, total)
 */
const getBalanceService = () => {
    return axios.get('/api/payout/balance');
};

/**
 * Request withdraw - Yêu cầu rút tiền
 * @param {Array} payoutIds - Danh sách payout IDs cần rút
 * @param {Object} bankInfo - Thông tin ngân hàng
 * @param {string} bankInfo.bankName - Tên ngân hàng
 * @param {string} bankInfo.accountNumber - Số tài khoản
 * @param {string} bankInfo.accountName - Tên chủ tài khoản
 */
const requestWithdrawService = (payoutIds, bankInfo) => {
    return axios.post('/api/payout/withdraw', {
        payoutIds,
        bankInfo
    });
};

/**
 * Get payout history - Lấy lịch sử các lần rút tiền
 * @param {number} limit - Số lượng records
 * @param {number} offset - Vị trí bắt đầu
 */
const getPayoutHistoryService = (limit = 20, offset = 0) => {
    return axios.get(`/api/payout/history?limit=${limit}&offset=${offset}`);
};

//  ADMIN PAYOUT SERVICES 

/**
 * Get pending payouts - Lấy danh sách payouts đang chờ xử lý (Admin)
 * @param {number} limit - Số lượng records
 * @param {number} offset - Vị trí bắt đầu
 */
const getPendingPayoutsService = (limit = 50, offset = 0) => {
    return axios.get(`/api/payout/admin/pending?limit=${limit}&offset=${offset}`);
};

/**
 * Process payout - Xử lý payout (Approve/Reject) - Admin only
 * @param {number} payoutId - ID của payout cần xử lý
 * @param {string} action - 'approve' hoặc 'reject'
 * @param {string} note - Ghi chú (optional)
 */
const processPayoutService = (payoutId, action, note = '') => {
    return axios.post(`/api/payout/admin/process/${payoutId}`, {
        action,
        note
    });
};

/**
 * Get payout statistics - Lấy thống kê payout (Admin)
 */
const getPayoutStatisticsService = () => {
    return axios.get('/api/payout/admin/statistics');
};

/**
 * Get all payouts - Lấy tất cả payouts (Admin)
 * @param {Object} filters - Bộ lọc
 * @param {string} filters.status - Filter by status
 * @param {string} filters.providerId - Filter by provider
 * @param {number} limit - Số lượng records
 * @param {number} offset - Vị trí bắt đầu
 */
const getAllPayoutsService = (filters = {}, limit = 50, offset = 0) => {
    let url = `/api/payout/admin/all?limit=${limit}&offset=${offset}`;
    if (filters.status) url += `&status=${filters.status}`;
    if (filters.providerId) url += `&providerId=${filters.providerId}`;
    return axios.get(url);
};

//  BACKWARDS COMPATIBILITY 
const getProviderRevenueService = getBalanceService;

export {
    // Provider Services
    getMyPayoutsService,
    getBalanceService,
    requestWithdrawService,
    getPayoutHistoryService,

    // Admin Services
    getPendingPayoutsService,
    processPayoutService,
    getPayoutStatisticsService,
    getAllPayoutsService,

    // Backwards compatibility
    getProviderRevenueService
};

export default {
    getMyPayoutsService,
    getBalanceService,
    requestWithdrawService,
    getPayoutHistoryService,
    getPendingPayoutsService,
    processPayoutService,
    getPayoutStatisticsService,
    getAllPayoutsService,
    getProviderRevenueService
};
