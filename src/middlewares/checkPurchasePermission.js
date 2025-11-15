const db = require('../models');
const transactionService = require('../services/transactionService');

/**
 * Middleware to check if user has purchased the dataset before downloading
 */
const checkPurchasePermission = async (req, res, next) => {
    console.log('========== CHECK PERMISSION START ==========');
    console.log('1. User ID:', req.user?.id);
    console.log('2. File ID:', req.params.fileId);

    try {
        const userId = req.user.id;
        const fileId = req.params.fileId;

        // 1. Get dataset ID from file ID
        const file = await db.DatasetFile.findOne({
            where: { id: fileId },
            include: [{
                model: db.Dataset,
                as: 'dataset',
                attributes: ['id']
            }]
        });

        console.log('3. File found:', file ? {
            id: file.id,
            fileName: file.fileName || file.file_name,
            datasetId: file.dataset?.id
        } : 'NOT FOUND');

        if (!file) {
            console.log('❌ File not found in database');
            return res.status(404).json({
                errCode: 1,
                message: 'File not found'
            });
        }

        const datasetId = file.dataset.id;
        console.log('4. Dataset ID:', datasetId);

        // 2. Check download permission
        const permission = await transactionService.checkDownloadPermission(
            userId,
            datasetId
        );

        console.log('5. Permission result:', permission);

        if (!permission.allowed) {
            console.log('❌ Permission denied');
            return res.status(403).json({
                errCode: 3,
                message: permission.message,
                details: {
                    type: permission.type,
                    downloadCount: permission.downloadCount,
                    downloadLimit: permission.downloadLimit
                }
            });
        }

        console.log('✅ Permission granted');
        console.log('========== CHECK PERMISSION END ==========');

        // 3. Attach permission info to request for logging
        req.downloadPermission = permission;
        req.datasetId = datasetId;

        next();

    } catch (error) {
        console.error('========== CHECK PERMISSION ERROR ==========');
        console.error('Error details:', error);
        console.error('Stack:', error.stack);
        return res.status(500).json({
            errCode: -1,
            message: 'Server error checking permission',
            error: error.message
        });
    }
};

module.exports = {
    checkPurchasePermission
};