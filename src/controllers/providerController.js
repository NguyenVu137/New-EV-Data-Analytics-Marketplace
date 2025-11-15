const datasetService = require('../services/datasetService');
const path = require('path');
const fs = require('fs');
const db = require('../models');
const transactionService = require('../services/transactionService');


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
    console.log(' DOWNLOAD DEBUG START ');
    console.log('1. Request params:', req.params);
    console.log('2. User ID:', req.user?.id);
    console.log('3. Dataset ID from middleware:', req.datasetId);

    try {
        const fileId = req.params.fileId;
        const userId = req.user.id;

        // Get file from database
        const file = await db.DatasetFile.findByPk(fileId);
        console.log('4. File from DB:', file ? {
            id: file.id,
            fileName: file.fileName,
            file_name: file.file_name,
            file_url: file.file_url
        } : 'NOT FOUND');

        if (!file) {
            console.log('❌ File not found in database');
            return res.status(404).json({ errCode: 1, message: 'File not found' });
        }

        // Use original file name for download
        const originalFileName = file.fileName || file.file_name || 'downloaded_file';
        // Use actual stored file name from file_url
        const storedFileName = path.basename(file.file_url);

        // Build full file path
        const filePath = path.join(process.cwd(), 'uploads', 'datasets', storedFileName);

        console.log('5. File path:', filePath, '→ Exists:', fs.existsSync(filePath));

        if (!fs.existsSync(filePath)) {
            console.log('❌ File not found on server');
            return res.status(404).json({ errCode: 1, message: 'File not found on server' });
        }

        // Log download & increment downloadCount
        try {
            // Log to transactionService
            await transactionService.logDownload(userId, req.datasetId, req.ip);

            // Optional: increment downloadCount in DatasetFile table
            if (typeof file.downloadCount === 'number') {
                file.downloadCount += 1;
                await file.save();
            }

            console.log('✅ Download logged successfully');
        } catch (logError) {
            console.log('⚠️ Failed to log download:', logError.message);
        }

        console.log('6. Sending file...');
        console.log(' DOWNLOAD DEBUG END ');

        // Send file for download
        return res.download(filePath, originalFileName, (err) => {
            if (err) {
                console.error('❌ Error sending file:', err);
                if (!res.headersSent) {
                    return res.status(500).json({ errCode: -1, message: 'Error downloading file' });
                }
            }
            console.log('✅ File sent successfully');
        });

    } catch (error) {
        console.error(' DOWNLOAD ERROR ');
        console.error('Error details:', error);
        console.error('Stack:', error.stack);
        return res.status(500).json({
            errCode: -1,
            message: 'Server error downloading file',
            error: error.message
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