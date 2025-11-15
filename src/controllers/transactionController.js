const transactionService = require('../services/transactionService');

// ==================== PURCHASE DATASET ====================
const purchaseDataset = async (req, res) => {
    try {
        const consumerId = req.user.id;
        const { datasetId, packageType, paymentMethod } = req.body;

        if (!datasetId || !packageType || !paymentMethod) {
            return res.status(400).json({
                errCode: 1,
                message: 'Missing required fields'
            });
        }

        const result = await transactionService.purchaseDataset(
            consumerId,
            datasetId,
            packageType,
            paymentMethod
        );

        if (result.errCode !== 0) {
            return res.status(400).json(result);
        }

        return res.status(201).json(result);
    } catch (e) {
        console.error('Purchase error:', e);
        return res.status(500).json({
            errCode: -1,
            message: 'Server error',
            error: e.message
        });
    }
};

// ==================== CHECK DOWNLOAD PERMISSION ====================
const checkDownloadPermission = async (req, res) => {
    try {
        const consumerId = req.user.id;
        const datasetId = req.params.datasetId;

        const permission = await transactionService.checkDownloadPermission(
            consumerId,
            datasetId
        );

        return res.status(200).json({
            errCode: 0,
            ...permission
        });
    } catch (e) {
        console.error('Check permission error:', e);
        return res.status(500).json({
            errCode: -1,
            message: 'Server error'
        });
    }
};

// ==================== GET USER PURCHASES ====================
const getUserPurchases = async (req, res) => {
    try {
        const consumerId = req.user.id;
        const purchases = await transactionService.getUserPurchases(consumerId);

        return res.status(200).json({
            errCode: 0,
            data: purchases
        });
    } catch (e) {
        console.error('Get purchases error:', e);
        return res.status(500).json({
            errCode: -1,
            message: 'Server error'
        });
    }
};

// ==================== OLD FUNCTIONS (Keep for compatibility) ====================
const createTransaction = async (req, res) => {
    try {
        const transaction = await transactionService.createTransaction(req.body);
        return res.status(201).json({ errCode: 0, transaction });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ errCode: -1, message: 'Server error' });
    }
};

const getProviderRevenue = async (req, res) => {
    try {
        const providerId = req.user.id;
        const revenue = await transactionService.getProviderRevenue(providerId);
        return res.status(200).json({ errCode: 0, revenue });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ errCode: -1, message: 'Server error' });
    }
};

module.exports = {
    createTransaction,
    getProviderRevenue,
    purchaseDataset,
    checkDownloadPermission,
    getUserPurchases
};