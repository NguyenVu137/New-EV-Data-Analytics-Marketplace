const datasetService = require('../services/datasetService');
const consumerController = require('./consumerController');

const getHomePage = async (req, res) => {
    return consumerController.getApprovedDatasets(req, res);
};

const searchDatasets = async (req, res) => {
    return consumerController.searchDatasets(req, res);
};

const uploadDataset = async (req, res) => {
    try {
        const providerId = req.user.id;
        const dataset = await datasetService.createDataset(providerId, req.body);
        return res.status(201).json({ errCode: 0, dataset });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ errCode: -1, message: 'Server error' });
    }
};

module.exports = {
    getHomePage,
    searchDatasets,
    uploadDataset
};
