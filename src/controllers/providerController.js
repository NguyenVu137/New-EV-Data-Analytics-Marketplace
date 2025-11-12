const datasetService = require('../services/datasetService');

// Get provider's own datasets
const getMyDatasets = async (req, res) => {
    try {
        const providerId = req.user.id;
        const datasets = await datasetService.getProviderDatasets(providerId);
        return res.status(200).json({ errCode: 0, data: datasets });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ errCode: -1, message: 'Server error' });
    }
};

// Upload/Create new dataset
const uploadDataset = async (req, res) => {
    try {
        const providerId = req.user.id;
        const dataset = await datasetService.uploadDataset(providerId, req.body);
        return res.status(201).json({ errCode: 0, message: 'Upload thành công', dataset });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ errCode: -1, message: 'Server error' });
    }
};

// Update dataset
const updateDataset = async (req, res) => {
    try {
        const providerId = req.user.id;
        const datasetId = req.params.id;
        const result = await datasetService.updateDataset(datasetId, providerId, req.body);
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(500).json({ errCode: -1, message: 'Server error' });
    }
};

// Delete dataset
const deleteDataset = async (req, res) => {
    try {
        const providerId = req.user.id;
        const datasetId = req.params.id;
        const result = await datasetService.deleteDataset(datasetId, providerId);
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(500).json({ errCode: -1, message: 'Server error' });
    }
};

module.exports = {
    getMyDatasets,
    uploadDataset,
    updateDataset,
    deleteDataset
};