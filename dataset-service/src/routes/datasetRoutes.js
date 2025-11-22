import express from 'express';
const { Op } = require('sequelize');
const Dataset = require('../models/Dataset');
const DatasetFile = require('../models/DatasetFile');
const { auth } = require('../../shared/middleware/auth');
const { checkRole } = require('../../shared/middleware/checkRole');
const upload = require('../config/multerConfig');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Partial update dataset
router.patch('/:id', auth, async (req, res) => {
    try {
        const dataset = await Dataset.findByPk(req.params.id);
        if (!dataset) {
            return res.status(404).json({
                errCode: 1,
                message: 'Dataset not found'
            });
        }

        // Check ownership
        if (dataset.provider_id !== req.user.id && req.user.roleId !== 'R1') {
            return res.status(403).json({
                errCode: 2,
                message: 'Access denied'
            });
        }

        const DatasetMetadata = require('../models/DatasetMetadata');
        // Nếu gửi bằng FormData, các trường sẽ nằm ở req.body (multer tự parse)
        // Nếu có trường nào bị undefined, thử lấy từ req.body.fields (nếu có)
        let { metadata, ...updateData } = req.body;
        // Nếu metadata là string (do FormData), parse lại
        if (typeof metadata === 'string') {
            try {
                metadata = JSON.parse(metadata);
            } catch (e) {
                metadata = [];
            }
        }
        // Log dữ liệu nhận được để debug
        console.log('PATCH nhận dữ liệu:', { ...updateData, metadata });
        // Chỉ giữ lại các trường hợp lệ cho Dataset
        const allowedFields = [
            'title', 'description', 'category_code', 'format_code', 'size',
            'basicPrice', 'standardPrice', 'premiumPrice', 'status_code'
        ];
        const filteredUpdate = {};
        for (const key of allowedFields) {
            let value = updateData[key];
            if (value === undefined && req.body.fields && req.body.fields[key] !== undefined) {
                value = req.body.fields[key];
            }
            if (value !== undefined) {
                if ([
                    'basicPrice', 'standardPrice', 'premiumPrice', 'size'
                ].includes(key)) {
                    filteredUpdate[key] = value !== '' ? parseFloat(value) : null;
                } else {
                    filteredUpdate[key] = value;
                }
            }
        }
        console.log('PATCH update vào DB:', filteredUpdate);
        await dataset.update(filteredUpdate);

        // Nếu có metadata thì cập nhật lại metadata
        if (Array.isArray(metadata)) {
            // Xóa metadata cũ
            await DatasetMetadata.destroy({ where: { dataset_id: dataset.id } });
            // Thêm metadata mới
            if (metadata.length > 0) {
                await Promise.all(metadata.map(item => {
                    return DatasetMetadata.create({
                        dataset_id: dataset.id,
                        key: item.key,
                        value: item.value
                    });
                }));
            }
        }
        // Trả về dataset đã cập nhật từ DB kèm files và metadata
        const files = await DatasetFile.findAll({
            where: { dataset_id: dataset.id },
            order: [['created_at', 'DESC']]
        });
        const metadataRows = await DatasetMetadata.findAll({
            where: { dataset_id: dataset.id }
        });
        const metadataRes = metadataRows.map(m => ({ key: m.key, value: m.value }));
        res.json({
            errCode: 0,
            message: 'Dataset updated successfully',
            data: {
                ...dataset.toJSON(),
                files,
                metadata: metadataRes
            }
        });
    } catch (error) {
        res.status(500).json({
            errCode: -1,
            message: 'Failed to update dataset'
        });
    }
});

// Get all datasets (public)
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, status = 'S2' } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows } = await Dataset.findAndCountAll({
            where: { status_code: status },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        res.json({
            errCode: 0,
            message: 'Get datasets successfully',
            data: {
                datasets: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            errCode: -1,
            message: 'Failed to get datasets',
            error: error.message
        });
    }
});

// Get my datasets (Provider)
router.get('/my-datasets', auth, checkRole(['R2', 'R1']), async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows } = await Dataset.findAndCountAll({
            where: { provider_id: req.user.id },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        // Lấy files và metadata cho từng dataset
        const DatasetMetadata = require('../models/DatasetMetadata');
        const datasetsWithFiles = await Promise.all(rows.map(async (dataset) => {
            // Lấy lại dataset mới nhất từ DB
            const freshDataset = await Dataset.findByPk(dataset.id);
            // Lấy files
            const files = await DatasetFile.findAll({
                where: { dataset_id: dataset.id },
                order: [['created_at', 'DESC']]
            });
            // Lấy metadata từ bảng DatasetMetadata
            const metadataRows = await DatasetMetadata.findAll({
                where: { dataset_id: dataset.id }
            });
            const metadata = metadataRows.map(m => ({ key: m.key, value: m.value }));
            return {
                ...freshDataset.toJSON(),
                files,
                metadata
            };
        }));

        res.json({
            errCode: 0,
            message: 'Get my datasets successfully',
            data: {
                datasets: datasetsWithFiles,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            errCode: -1,
            message: 'Failed to get my datasets',
            error: error.message
        });
    }
});

// Get all datasets for admin
router.get('/admin/all', auth, checkRole(['R1']), async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const offset = (page - 1) * limit;

        let where = {};
        // Nếu status là ALL hoặc không truyền, không lọc theo trạng thái
        if (status && status !== 'ALL') {
            where.status_code = status;
        }
        // Nếu status là ALL, bỏ qua where.status_code

        const { count, rows } = await Dataset.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        res.json({
            errCode: 0,
            message: 'Get all datasets successfully',
            data: {
                datasets: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.max(1, Math.ceil(count / limit))
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            errCode: -1,
            message: 'Failed to get all datasets',
            error: error.message
        });
    }
});

// Get dataset by ID
router.get('/:id', async (req, res) => {
    try {
        const dataset = await Dataset.findByPk(req.params.id);
        if (!dataset) {
            return res.status(404).json({
                errCode: 1,
                message: 'Dataset not found'
            });
        }
        res.json({
            errCode: 0,
            data: dataset
        });
    } catch (error) {
        res.status(500).json({
            errCode: -1,
            message: 'Failed to get dataset'
        });
    }
});

// Create dataset (Provider only)
router.post('/', auth, checkRole(['R2']), async (req, res) => {
    try {
        const DatasetMetadata = require('../models/DatasetMetadata');
        const { metadata, ...datasetData } = req.body;
        const dataset = await Dataset.create({
            ...datasetData,
            provider_id: req.user.id,
            status_code: 'S1' // Pending approval
        });

        // Nếu có metadata thì lưu vào bảng dataset_metadata
        if (Array.isArray(metadata) && metadata.length > 0) {
            await Promise.all(metadata.map(item => {
                return DatasetMetadata.create({
                    dataset_id: dataset.id,
                    key: item.key,
                    value: item.value
                });
            }));
        }

        res.status(201).json({
            errCode: 0,
            message: 'Dataset created successfully',
            data: dataset
        });
    } catch (error) {
        res.status(500).json({
            errCode: -1,
            message: 'Failed to create dataset',
            error: error.message
        });
    }
});

// Update dataset
router.put('/:id', auth, async (req, res) => {
    try {
        const dataset = await Dataset.findByPk(req.params.id);
        if (!dataset) {
            return res.status(404).json({
                errCode: 1,
                message: 'Dataset not found'
            });
        }

        // Check ownership
        if (dataset.provider_id !== req.user.id && req.user.roleId !== 'R1') {
            return res.status(403).json({
                errCode: 2,
                message: 'Access denied'
            });
        }

        const DatasetMetadata = require('../models/DatasetMetadata');
        const { metadata, ...updateData } = req.body;
        await dataset.update(updateData);

        // Nếu có metadata thì cập nhật lại metadata
        if (Array.isArray(metadata)) {
            // Xóa metadata cũ
            await DatasetMetadata.destroy({ where: { dataset_id: dataset.id } });
            // Thêm metadata mới
            if (metadata.length > 0) {
                await Promise.all(metadata.map(item => {
                    return DatasetMetadata.create({
                        dataset_id: dataset.id,
                        key: item.key,
                        value: item.value
                    });
                }));
            }
        }
        res.json({
            errCode: 0,
            message: 'Dataset updated successfully',
            data: dataset
        });
    } catch (error) {
        res.status(500).json({
            errCode: -1,
            message: 'Failed to update dataset'
        });
    }
});

// Delete dataset
router.delete('/:id', auth, async (req, res) => {
    try {
        const dataset = await Dataset.findByPk(req.params.id);
        if (!dataset) {
            return res.status(404).json({
                errCode: 1,
                message: 'Dataset not found'
            });
        }

        if (dataset.provider_id !== req.user.id && req.user.roleId !== 'R1') {
            return res.status(403).json({
                errCode: 2,
                message: 'Access denied'
            });
        }

        await dataset.destroy();
        res.json({
            errCode: 0,
            message: 'Dataset deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            errCode: -1,
            message: 'Failed to delete dataset'
        });
    }
});

// Admin: Approve dataset
router.put('/:id/approve', auth, checkRole(['R1']), async (req, res) => {
    try {
        const dataset = await Dataset.findByPk(req.params.id);
        if (!dataset) {
            return res.status(404).json({
                errCode: 1,
                message: 'Dataset not found'
            });
        }

        await dataset.update({ status_code: 'S2' });

        res.json({
            errCode: 0,
            message: 'Dataset approved successfully',
            data: dataset
        });
    } catch (error) {
        res.status(500).json({
            errCode: -1,
            message: 'Failed to approve dataset',
            error: error.message
        });
    }
});

// Admin: Reject dataset
router.put('/:id/reject', auth, checkRole(['R1']), async (req, res) => {
    try {
        const dataset = await Dataset.findByPk(req.params.id);
        if (!dataset) {
            return res.status(404).json({
                errCode: 1,
                message: 'Dataset not found'
            });
        }

        await dataset.update({ status_code: 'S3' });

        res.json({
            errCode: 0,
            message: 'Dataset rejected successfully',
            data: dataset
        });
    } catch (error) {
        res.status(500).json({
            errCode: -1,
            message: 'Failed to reject dataset',
            error: error.message
        });
    }
});

// Get top datasets for homepage
router.get('/top-data-home', async (req, res) => {
    try {
        const { limit = 6 } = req.query;

        const datasets = await Dataset.findAll({
            where: { status_code: 'S2' },
            limit: parseInt(limit),
            order: [['created_at', 'DESC']]
        });

        res.json({
            errCode: 0,
            message: 'Get top datasets successfully',
            data: datasets
        });
    } catch (error) {
        res.status(500).json({
            errCode: -1,
            message: 'Failed to get top datasets',
            error: error.message
        });
    }
});

// Search datasets
router.get('/search', async (req, res) => {
    try {
        const { keyword = '', category = '', format = '', page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const where = { status_code: 'S2' };

        if (keyword) {
            where[Op.or] = [
                { title: { [Op.like]: `%${keyword}%` } },
                { description: { [Op.like]: `%${keyword}%` } }
            ];
        }

        if (category) where.category_code = category;
        if (format) where.format_code = format;

        const { count, rows } = await Dataset.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        res.json({
            errCode: 0,
            message: 'Search datasets successfully',
            data: {
                datasets: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            errCode: -1,
            message: 'Failed to search datasets',
            error: error.message
        });
    }
});

// Upload dataset with files
router.post('/upload', auth, checkRole(['R2', 'R1']), upload.array('files', 10), async (req, res) => {
    try {
        const DatasetMetadata = require('../models/DatasetMetadata');
        let { metadata, title, description, category_code, format_code, basicPrice, standardPrice, premiumPrice } = req.body;

        // Parse metadata nếu là chuỗi JSON
        if (typeof metadata === 'string') {
            try {
                metadata = JSON.parse(metadata);
            } catch (e) {
                metadata = [];
            }
        }

        // Create dataset
        const dataset = await Dataset.create({
            provider_id: req.user.id,
            title,
            description,
            category_code,
            format_code,
            basicPrice: parseFloat(basicPrice) || 0,
            standardPrice: parseFloat(standardPrice) || 0,
            premiumPrice: parseFloat(premiumPrice) || 0,
            status_code: 'S1' // Pending
        });

        // Save files
        if (req.files && req.files.length > 0) {
            const filePromises = req.files.map(file => {
                return DatasetFile.create({
                    dataset_id: dataset.id,
                    file_name: file.originalname,
                    file_path: file.path,
                    file_size: file.size,
                    mime_type: file.mimetype
                });
            });
            await Promise.all(filePromises);
        }

        // Save metadata
        if (Array.isArray(metadata) && metadata.length > 0) {
            await Promise.all(metadata.map(item => {
                return DatasetMetadata.create({
                    dataset_id: dataset.id,
                    key: item.key,
                    value: item.value
                });
            }));
        }

        res.status(201).json({
            errCode: 0,
            message: 'Dataset uploaded successfully',
            data: dataset
        });
    } catch (error) {
        res.status(500).json({
            errCode: -1,
            message: 'Failed to upload dataset',
            error: error.message
        });
    }
});

// Download file (requires purchase permission check in gateway/middleware)
router.get('/download/:fileId', auth, async (req, res) => {
    try {
        const file = await DatasetFile.findByPk(req.params.fileId);

        if (!file) {
            return res.status(404).json({
                errCode: 1,
                message: 'File not found'
            });
        }

        // Check purchase permission via Transaction Service
        const ServiceClient = require('../../shared/utils/serviceClient');
        const transactionService = new ServiceClient(
            process.env.TRANSACTION_SERVICE_URL || 'http://transaction-service:8083',
            'Transaction'
        );

        const token = req.headers.authorization;
        transactionService.setAuthToken(token);

        try {
            const permissionCheck = await transactionService.get(`/api/transactions/check-permission/${file.dataset_id}`);

            if (!permissionCheck.allowed) {
                return res.status(403).json({
                    errCode: 3,
                    message: 'You must purchase this dataset to download files',
                    data: { purchaseRequired: true }
                });
            }
        } catch (error) {
            console.error('❌ Permission check failed:', error);
            return res.status(403).json({
                errCode: 4,
                message: 'Unable to verify purchase permission'
            });
        }

        // Check if file exists
        if (!fs.existsSync(file.file_path)) {
            return res.status(404).json({
                errCode: 2,
                message: 'File not found on server'
            });
        }

        // Send file
        res.download(file.file_path, file.file_name);
    } catch (error) {
        res.status(500).json({
            errCode: -1,
            message: 'Failed to download file',
            error: error.message
        });
    }
});

// Delete file
router.delete('/files/:fileId', auth, checkRole(['R2', 'R1']), async (req, res) => {
    try {
        const file = await DatasetFile.findByPk(req.params.fileId);

        if (!file) {
            return res.status(404).json({
                errCode: 1,
                message: 'File not found'
            });
        }

        // Get dataset to check ownership
        const dataset = await Dataset.findByPk(file.dataset_id);
        if (dataset.provider_id !== req.user.id && req.user.roleId !== 'R1') {
            return res.status(403).json({
                errCode: 2,
                message: 'Access denied'
            });
        }

        // Delete physical file
        if (fs.existsSync(file.file_path)) {
            fs.unlinkSync(file.file_path);
        }

        // Delete record
        await file.destroy();

        res.json({
            errCode: 0,
            message: 'File deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            errCode: -1,
            message: 'Failed to delete file',
            error: error.message
        });
    }
});

// Get files of a dataset
router.get('/:datasetId/files', auth, async (req, res) => {
    try {
        const dataset = await Dataset.findByPk(req.params.datasetId);

        if (!dataset) {
            return res.status(404).json({
                errCode: 1,
                message: 'Dataset not found'
            });
        }

        // Check if user has access (owner or purchased)
        const isOwner = dataset.provider_id === req.user.id || req.user.roleId === 'R1';

        if (!isOwner) {
            // Check if purchased
            const ServiceClient = require('../../shared/utils/serviceClient');
            const transactionService = new ServiceClient(
                process.env.TRANSACTION_SERVICE_URL || 'http://transaction-service:8083',
                'Transaction'
            );

            const token = req.headers.authorization;
            transactionService.setAuthToken(token);

            try {
                const permissionCheck = await transactionService.get(`/api/transactions/check-permission/${req.params.datasetId}`);

                if (!permissionCheck.allowed) {
                    return res.status(403).json({
                        errCode: 2,
                        message: 'Access denied. Purchase required.',
                        data: { purchaseRequired: true }
                    });
                }
            } catch (error) {
                return res.status(403).json({
                    errCode: 3,
                    message: 'Unable to verify access permission'
                });
            }
        }

        // Get files
        const files = await DatasetFile.findAll({
            where: { dataset_id: req.params.datasetId },
            order: [['created_at', 'DESC']]
        });

        res.json({
            errCode: 0,
            message: 'Get files successfully',
            data: files
        });
    } catch (error) {
        res.status(500).json({
            errCode: -1,
            message: 'Failed to get files',
            error: error.message
        });
    }
});

export default router;
