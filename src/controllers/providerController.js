const datasetService = require('../services/datasetService');
const path = require('path');
const fs = require('fs');
const db = require('../models');
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

const uploadDataset = async (req, res) => {
    try {
        const providerId = req.user.id;

        let metadata = [];
        if (req.body.metadata) {
            try {
                metadata = JSON.parse(req.body.metadata);
            } catch (e) {
                console.log('Metadata parse error:', e);
            }
        }

        const datasetData = {
            ...req.body,
            metadata: metadata
        };

        const dataset = await datasetService.uploadDataset(providerId, datasetData, req.files);
        return res.status(201).json({ errCode: 0, message: 'Upload thành công', dataset });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            errCode: -1,
            message: e.message || 'Server error'
        });
    }
};

const updateDataset = async (req, res) => {
    try {
        const providerId = req.user.id;
        const datasetId = req.params.id;

        let metadata = [];
        if (req.body.metadata) {
            try {
                metadata = JSON.parse(req.body.metadata);
            } catch (e) {
                console.log('Metadata parse error:', e);
            }
        }

        const datasetData = {
            ...req.body,
            metadata: metadata
        };

        const result = await datasetService.updateDataset(datasetId, providerId, datasetData, req.files);
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            errCode: -1,
            message: e.message || 'Server error'
        });
    }
};

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
}

const deleteFile = async (req, res) => {
    try {
        const providerId = req.user.id;
        const fileId = req.params.fileId;
        const result = await datasetService.deleteDatasetFile(fileId, providerId);
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(500).json({ errCode: -1, message: 'Server error' });
    }
};

const downloadFile = async (req, res) => {
    try {
        const fileId = req.params.fileId;

        const file = await db.DatasetFile.findOne({
            where: { id: fileId },
            include: [{
                model: db.Dataset,
                as: 'dataset',
                attributes: ['id', 'status_code']
            }]
        });

        if (!file) {
            return res.status(404).json({
                errCode: 1,
                message: 'File not found in database'
            });
        }

        if (file.dataset.status_code !== 'APPROVED') {
            return res.status(403).json({
                errCode: 2,
                message: 'Dataset not approved yet'
            });
        }

        const cleanPath = file.file_url.replace(/^\//, '');
        const filePath = path.join(__dirname, '..', '..', cleanPath);


        if (!fs.existsSync(filePath)) {
            console.error(' File not found at:', filePath);
            return res.status(404).json({
                errCode: 1,
                message: `File not found on server. Path: ${filePath}`
            });
        }

        console.log(` User ${req.user.id} downloading: ${file.file_name}`);

        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.file_name)}"`);
        res.setHeader('Content-Type', 'application/octet-stream');

        return res.sendFile(filePath, (err) => {
            if (err) {
                console.error(' Send file error:', err);
                if (!res.headersSent) {
                    return res.status(500).json({
                        errCode: -1,
                        message: 'Download failed'
                    });
                }
            } else {
                console.log(' File sent successfully');
            }
        });

    } catch (e) {
        console.error(' Download error:', e);
        return res.status(500).json({
            errCode: -1,
            message: 'Server error',
            error: e.message
        });
    }
};


module.exports = {
    getMyDatasets,
    uploadDataset,
    updateDataset,
    deleteDataset,
    deleteFile,
    downloadFile
};