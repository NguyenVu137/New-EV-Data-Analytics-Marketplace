const datasetService = require('../services/datasetService');

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

let getDetailDatasetById = async (req, res) => {
    try {
        let datasetId = req.params.id;
        let result = await datasetService.getDetailDataset(datasetId);
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: "Error from server"
        });
    }
}

module.exports = {
    getApprovedDatasets,
    searchDatasets,
    getDetailDatasetById
};
