const datasetService = require('../services/datasetService');
const consumerController = require('./consumerController');

// --- Consumer routes ---
const getApprovedDatasets = async (req, res) => {
    try {
        const datasets = await datasetService.getApprovedDatasets();
        return res.status(200).json({ errCode: 0, datasets });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ errCode: -1, message: 'Server error' });
    }
};

const searchDatasets = async (req, res) => {
    try {
        const filters = req.query;
        const results = await datasetService.searchDatasets(filters);
        return res.status(200).json({ errCode: 0, datasets: results });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ errCode: -1, message: 'Server error' });
    }
};

// --- Provider routes ---
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

// --- Admin routes ---
const approveDataset = async (req, res) => {
    try {
        const { datasetId } = req.body;
        const dataset = await datasetService.approveDataset(datasetId);
        return res.status(200).json({ errCode: 0, dataset });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ errCode: -1, message: 'Server error' });
    }
};

module.exports = {
    getApprovedDatasets,
    searchDatasets,
    uploadDataset,
    approveDataset
};
