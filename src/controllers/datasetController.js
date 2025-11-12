const datasetService = require('../services/datasetService');

// --- Consumer routes ---
// Get approved datasets
const getApprovedDatasets = async (req, res) => {
    try {
        const datasets = await datasetService.getApprovedDatasets();
        return res.status(200).json({ errCode: 0, datasets });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ errCode: -1, message: 'Server error' });
    }
};

// Search datasets
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

// --- Admin routes ---
// Approve dataset
const approveDataset = async (req, res) => {
    try {
        const { datasetId } = req.body;
        const result = await datasetService.approveDataset(datasetId);
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(500).json({ errCode: -1, message: 'Server error' });
    }
};

// Reject dataset
const rejectDataset = async (req, res) => {
    try {
        const { datasetId } = req.body;
        const { reason } = req.body;
        const result = await datasetService.rejectDataset(datasetId, reason);
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(500).json({ errCode: -1, message: 'Server error' });
    }
};

// Get all datasets for admin (including pending)
const getAllDatasetsForAdmin = async (req, res) => {
    try {
        const datasets = await datasetService.getAllDatasets();
        return res.status(200).json({ errCode: 0, data: datasets });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ errCode: -1, message: 'Server error' });
    }
};

module.exports = {
    getApprovedDatasets,
    searchDatasets,
    approveDataset,
    rejectDataset,
    getAllDatasetsForAdmin
};