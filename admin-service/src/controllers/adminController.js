const axios = require('axios');

// Import ServiceClient
const ServiceClient = require('../../shared/utils/serviceClient.js');

const authService = new ServiceClient(process.env.AUTH_SERVICE_URL || 'http://auth-service:8081');
const datasetService = new ServiceClient(process.env.DATASET_SERVICE_URL || 'http://dataset-service:8082');
const transactionService = new ServiceClient(process.env.TRANSACTION_SERVICE_URL || 'http://transaction-service:8083');
const analyticsService = new ServiceClient(process.env.ANALYTICS_SERVICE_URL || 'http://analytics-service:8084');

// ========== USER MANAGEMENT ==========

const getAllUsers = async (req, res) => {
    try {
        console.log('📋 Admin fetching all users from Auth Service');

        // Forward JWT token (already in "Bearer <token>" format)
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ errCode: 1, message: 'No token provided' });
        }
        authService.setAuthToken(token);

        const response = await authService.get('/api/users');
        console.log('📊 Auth Service response:', JSON.stringify(response).substring(0, 200));
        console.log('📊 response.data type:', typeof response.data, 'isArray:', Array.isArray(response.data));
        const finalResponse = { errCode: 0, users: response.data || [] };
        console.log('📊 Final response to frontend:', JSON.stringify(finalResponse).substring(0, 200));
        return res.status(200).json(finalResponse);
    } catch (error) {
        console.error('❌ Error fetching users:', error.message);
        return res.status(500).json({ errCode: -1, message: 'Failed to fetch users' });
    }
};

const createUser = async (req, res) => {
    try {
        console.log('➕ Admin creating new user');

        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ errCode: 1, message: 'No token provided' });
        }
        authService.setAuthToken(token);

        const response = await authService.post('/api/users', req.body);
        return res.status(200).json(response);
    } catch (error) {
        console.error('❌ Error creating user:', error.message);
        return res.status(500).json({ errCode: -1, message: 'Failed to create user' });
    }
};

const updateUser = async (req, res) => {
    try {
        console.log('✏️ Admin updating user:', req.body.id);

        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ errCode: 1, message: 'No token provided' });
        authService.setAuthToken(token);

        const response = await authService.put(`/api/users/${req.body.id}`, req.body);
        return res.status(200).json({ errCode: 0, users: response });
    } catch (error) {
        console.error('❌ Error updating user:', error.message);
        return res.status(500).json({ errCode: -1, message: 'Failed to update user' });
    }
};

const deleteUser = async (req, res) => {
    try {
        console.log('🗑️ Admin deleting user:', req.body.id);

        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ errCode: 1, message: 'No token provided' });
        authService.setAuthToken(token);

        await authService.delete(`/api/users/${req.body.id}`);
        return res.status(200).json({ errCode: 0, message: 'User deleted successfully' });
    } catch (error) {
        console.error('❌ Error deleting user:', error.message);
        return res.status(500).json({ errCode: -1, message: 'Failed to delete user' });
    }
};

// ========== DATASET APPROVAL ==========

const getPendingDatasets = async (req, res) => {
    try {
        console.log('📋 Admin fetching pending datasets');

        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ errCode: 1, message: 'No token provided' });
        datasetService.setAuthToken(token);

        // Get all datasets including pending (status S1)
        const response = await datasetService.get('/api/datasets?status=S1');
        return res.status(200).json({ errCode: 0, datasets: response.datasets || response });
    } catch (error) {
        console.error('❌ Error fetching pending datasets:', error.message);
        return res.status(500).json({ errCode: -1, message: 'Failed to fetch pending datasets' });
    }
};

const approveDataset = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('✅ Admin approving dataset:', id);

        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ errCode: 1, message: 'No token provided' });
        datasetService.setAuthToken(token);

        // Update dataset status to S2 (approved)
        const response = await datasetService.put(`/api/datasets/${id}`, { status_code: 'S2' });
        return res.status(200).json({ errCode: 0, message: 'Dataset approved', dataset: response });
    } catch (error) {
        console.error('❌ Error approving dataset:', error.message);
        return res.status(500).json({ errCode: -1, message: 'Failed to approve dataset' });
    }
};

const rejectDataset = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('❌ Admin rejecting dataset:', id);

        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ errCode: 1, message: 'No token provided' });
        datasetService.setAuthToken(token);

        // Update dataset status to S3 (rejected)
        const response = await datasetService.put(`/api/datasets/${id}`, { status_code: 'S3' });
        return res.status(200).json({ errCode: 0, message: 'Dataset rejected', dataset: response });
    } catch (error) {
        console.error('❌ Error rejecting dataset:', error.message);
        return res.status(500).json({ errCode: -1, message: 'Failed to reject dataset' });
    }
};

// ========== PAYOUT MANAGEMENT ==========

const getPendingPayouts = async (req, res) => {
    try {
        console.log('📋 Admin fetching pending payouts');

        const { limit = 10, offset = 0 } = req.query;

        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ errCode: 1, message: 'No token provided' });
        transactionService.setAuthToken(token);

        const response = await transactionService.get(`/api/payouts/pending?limit=${limit}&offset=${offset}`);
        return res.status(200).json({ errCode: 0, ...response });
    } catch (error) {
        console.error('❌ Error fetching pending payouts:', error.message);
        return res.status(500).json({ errCode: -1, message: 'Failed to fetch pending payouts' });
    }
};

const processPayoutRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, note } = req.body;

        console.log(`💰 Admin processing payout ${id}: ${action}`);

        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ errCode: 1, message: 'No token provided' });
        transactionService.setAuthToken(token);

        const response = await transactionService.post(`/api/payouts/${id}/process`, { action, note });
        return res.status(200).json({ errCode: 0, ...response });
    } catch (error) {
        console.error('❌ Error processing payout:', error.message);
        return res.status(500).json({ errCode: -1, message: 'Failed to process payout' });
    }
};

const getPayoutStatistics = async (req, res) => {
    try {
        console.log('📊 Admin fetching payout statistics');

        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ errCode: 1, message: 'No token provided' });
        transactionService.setAuthToken(token);

        const response = await transactionService.get('/api/payouts/statistics');
        return res.status(200).json({ errCode: 0, ...response });
    } catch (error) {
        console.error('❌ Error fetching payout statistics:', error.message);
        return res.status(500).json({ errCode: -1, message: 'Failed to fetch payout statistics' });
    }
};

const getAllPayouts = async (req, res) => {
    try {
        console.log('📋 Admin fetching all payouts');

        const { limit = 10, offset = 0, status } = req.query;
        let queryString = `limit=${limit}&offset=${offset}`;
        if (status) queryString += `&status=${status}`;

        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ errCode: 1, message: 'No token provided' });
        transactionService.setAuthToken(token);

        const response = await transactionService.get(`/api/payouts?${queryString}`);
        return res.status(200).json({ errCode: 0, ...response });
    } catch (error) {
        console.error('❌ Error fetching all payouts:', error.message);
        return res.status(500).json({ errCode: -1, message: 'Failed to fetch payouts' });
    }
};

// ========== ANALYTICS DASHBOARD ==========

const getAnalyticsOverview = async (req, res) => {
    try {
        console.log('📊 Admin fetching analytics overview');

        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ errCode: 1, message: 'No token provided' });
        analyticsService.setAuthToken(token);

        const response = await analyticsService.get('/api/analytics/market-overview');
        return res.status(200).json({ errCode: 0, ...response });
    } catch (error) {
        console.error('❌ Error fetching analytics overview:', error.message);
        return res.status(500).json({ errCode: -1, message: 'Failed to fetch analytics overview' });
    }
};

const getAIInsights = async (req, res) => {
    try {
        console.log('🤖 Admin fetching AI insights');

        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ errCode: 1, message: 'No token provided' });
        analyticsService.setAuthToken(token);

        const response = await analyticsService.get('/api/analytics/ai-insights');
        return res.status(200).json({ errCode: 0, ...response });
    } catch (error) {
        console.error('❌ Error fetching AI insights:', error.message);
        return res.status(500).json({ errCode: -1, message: 'Failed to fetch AI insights' });
    }
};

export default {
    // User Management
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,

    // Dataset Approval
    getPendingDatasets,
    approveDataset,
    rejectDataset,

    // Payout Management
    getPendingPayouts,
    processPayoutRequest,
    getPayoutStatistics,
    getAllPayouts,

    // Analytics
    getAnalyticsOverview,
    getAIInsights
};

module.exports = {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    getPendingDatasets,
    approveDataset,
    rejectDataset,
    getPendingPayouts,
    processPayoutRequest,
    getPayoutStatistics,
    getAllPayouts,
    getAnalyticsOverview,
    getAIInsights
};
