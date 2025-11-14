const datasetService = require('../services/datasetService');

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

let getTopDataHome = async (req, res) => {
    let limit = req.query.limit;
    if (!limit) limit = 10;
    try {
        let response = await datasetService.getTopDataHome(+limit);
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            errCode: -1,
            message: "Error from server..."
        })
    }
}
// --- Admin routes ---
const approveDataset = async (req, res) => {
    try {
        const datasetId = req.params.id;
        const result = await datasetService.approveDataset(datasetId);
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(500).json({ errCode: -1, message: 'Server error' });
    }
};

const rejectDataset = async (req, res) => {
    try {
        const datasetId = req.params.id;
        const { reason } = req.body;
        const result = await datasetService.rejectDataset(datasetId, reason);
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(500).json({ errCode: -1, message: 'Server error' });
    }
};

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
    getAllDatasetsForAdmin,
    getTopDataHome: getTopDataHome
};