const transactionService = require('../services/transactionService');

//  CREATE TRANSACTION (Purchase) 
const createTransaction = async (req, res) => {
    try {
        const consumerId = req.user.id;
        const { datasetId, packageType, paymentMethod } = req.body;

        if (!datasetId || !packageType || !paymentMethod) {
            return res.status(400).json({
                errCode: 1,
                message: 'Thiếu thông tin bắt buộc'
            });
        }

        const result = await transactionService.createTransaction(
            consumerId,
            datasetId,
            packageType,
            paymentMethod
        );

        return res.status(201).json(result);

    } catch (error) {
        console.error('Create transaction error:', error);
        return res.status(200).json({
            errCode: -1,
            message: error.message || 'Lỗi khi tạo giao dịch'
        });
    }
};

//  PAYMENT CALLBACK 
const paymentCallback = async (req, res) => {
    try {
        const { transactionId, status } = req.body;

        if (!transactionId || !status) {
            return res.status(400).json({
                errCode: 1,
                message: 'Invalid callback data'
            });
        }

        const result = await transactionService.processPaymentCallback(
            transactionId,
            status
        );

        return res.status(200).json(result);

    } catch (error) {
        console.error('Payment callback error:', error);
        return res.status(500).json({
            errCode: -1,
            message: 'Lỗi khi xử lý callback',
            error: error.message
        });
    }
};

//  SIMULATE PAYMENT (DEV ONLY) 
const simulatePayment = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const { status = 'success' } = req.body;

        const result = await transactionService.processPaymentCallback(
            transactionId,
            status
        );

        return res.status(200).json(result);

    } catch (error) {
        console.error('Simulate payment error:', error);
        return res.status(500).json({
            errCode: -1,
            message: 'Lỗi khi giả lập thanh toán',
            error: error.message
        });
    }
};

//  CHECK DOWNLOAD PERMISSION 
const checkDownloadPermission = async (req, res) => {
    try {
        const consumerId = req.user.id;
        const { datasetId } = req.params;

        const permission = await transactionService.checkDownloadPermission(
            consumerId,
            datasetId
        );

        return res.status(200).json({
            errCode: 0,
            ...permission
        });

    } catch (error) {
        console.error('Check permission error:', error);
        return res.status(500).json({
            errCode: -1,
            message: 'Lỗi khi kiểm tra quyền download'
        });
    }
};

//  GET USER PURCHASES 
const getUserPurchases = async (req, res) => {
    try {
        const consumerId = req.user.id;
        const purchases = await transactionService.getUserPurchases(consumerId);

        return res.status(200).json({
            errCode: 0,
            data: purchases
        });

    } catch (error) {
        console.error('Get purchases error:', error);
        return res.status(500).json({
            errCode: -1,
            message: 'Lỗi khi lấy danh sách mua hàng'
        });
    }
};

//  GET USER TRANSACTIONS 
const getUserTransactions = async (req, res) => {
    try {
        const consumerId = req.user.id;
        const { limit = 20, offset = 0 } = req.query;

        const result = await transactionService.getUserTransactions(consumerId, {
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        return res.status(200).json(result);

    } catch (error) {
        console.error('Get transactions error:', error);
        return res.status(500).json({
            errCode: -1,
            message: 'Lỗi khi lấy danh sách giao dịch',
            error: error.message
        });
    }
};

module.exports = {
    createTransaction,
    paymentCallback,
    simulatePayment,
    checkDownloadPermission,
    getUserPurchases,
    getUserTransactions
};