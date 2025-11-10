const transactionService = require('../services/transactionService');

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
    getProviderRevenue
};
