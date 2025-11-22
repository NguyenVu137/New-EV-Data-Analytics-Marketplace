const ServiceClient = require('../utils/serviceClient');

const checkPurchasePermission = async (req, res, next) => {
    try {
        // Get datasetId from file or dataset
        let datasetId = req.params.datasetId;
        
        // If downloading file, get dataset_id from DatasetFile
        if (req.params.fileId) {
            const DatasetFile = require('../../dataset-service/src/models/DatasetFile');
            const file = await DatasetFile.findByPk(req.params.fileId);
            if (!file) {
                return res.status(404).json({
                    errCode: 1,
                    message: 'File not found'
                });
            }
            datasetId = file.dataset_id;
        }

        // Check permission from Transaction Service
        const transactionService = new ServiceClient(
            process.env.TRANSACTION_SERVICE_URL || 'http://transaction-service:8083',
            'Transaction'
        );

        const token = req.headers.authorization;
        transactionService.setAuthToken(token);

        const response = await transactionService.get(`/api/transactions/check-permission/${datasetId}`);

        if (response.errCode === 0 && response.allowed) {
            next(); // Permission granted
        } else {
            return res.status(403).json({
                errCode: 2,
                message: 'You must purchase this dataset to download',
                data: { purchaseRequired: true }
            });
        }
    } catch (error) {
        console.error('❌ Check purchase permission error:', error);
        return res.status(500).json({
            errCode: -1,
            message: 'Failed to check download permission'
        });
    }
};

module.exports = { checkPurchasePermission };
