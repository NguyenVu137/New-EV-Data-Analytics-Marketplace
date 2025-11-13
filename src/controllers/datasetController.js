const { Dataset } = require('../models');
const { Op } = require('sequelize');

const datasetController = {
    /**
     * GET /api/datasets - Danh sách dataset với bộ lọc và phân trang
     */
    async getAllDatasets(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const perPage = Math.min(parseInt(req.query.perPage) || 12, 100);
            const offset = (page - 1) * perPage;

            // Build where clause for filters
            const whereClause = {};

            // Search by keyword
            if (req.query.q) {
                whereClause[Op.or] = [
                    { name: { [Op.like]: `%${req.query.q}%` } },
                    { description: { [Op.like]: `%${req.query.q}%` } }
                ];
            }

            // Filter by data_type
            if (req.query.data_type) {
                whereClause.data_type = req.query.data_type;
            }

            // Filter by region
            if (req.query.region) {
                whereClause.region = req.query.region;
            }

            // Filter by format
            if (req.query.format) {
                whereClause.format = req.query.format;
            }

            // Filter by provider
            if (req.query.provider) {
                whereClause.provider = req.query.provider;
            }

            // Filter by vehicle_type
            if (req.query.vehicle_type) {
                whereClause.vehicle_type = req.query.vehicle_type;
            }

            // Filter by battery_type
            if (req.query.battery_type) {
                whereClause.battery_type = req.query.battery_type;
            }

            // Filter by time range
            if (req.query.timeRangeStart || req.query.timeRangeEnd) {
                whereClause.upload_date = {};
                if (req.query.timeRangeStart) {
                    // timeRangeStart is in format YYYY-MM-DD
                    whereClause.upload_date[Op.gte] = new Date(req.query.timeRangeStart);
                }
                if (req.query.timeRangeEnd) {
                    // timeRangeEnd is in format YYYY-MM-DD, set to end of day
                    const endDate = new Date(req.query.timeRangeEnd);
                    endDate.setHours(23, 59, 59, 999);
                    whereClause.upload_date[Op.lte] = endDate;
                }
            }

            // Fetch total count
            const total = await Dataset.count({ where: whereClause });

            // Fetch paginated data
            const items = await Dataset.findAll({
                where: whereClause,
                offset: offset,
                limit: perPage,
                order: [['upload_date', 'DESC']],
                raw: true
            });

            res.json({
                success: true,
                total: total,
                page: page,
                perPage: perPage,
                totalPages: Math.ceil(total / perPage),
                items: items
            });
        } catch (error) {
            console.error('Error fetching datasets:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch datasets',
                message: error.message
            });
        }
    },

    /**
     * GET /api/datasets/:id - Chi tiết dataset
     */
    async getDatasetById(req, res) {
        try {
            const { id } = req.params;

            const dataset = await Dataset.findByPk(id);

            if (!dataset) {
                return res.status(404).json({
                    success: false,
                    error: 'Dataset not found'
                });
            }

            res.json({
                success: true,
                data: dataset
            });
        } catch (error) {
            console.error('Error fetching dataset:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch dataset',
                message: error.message
            });
        }
    },

    /**
     * POST /api/datasets/:id/purchase - Mua dataset
     */
    async purchaseDataset(req, res) {
        try {
            const { id } = req.params;
            const { priceType } = req.body;

            if (!['basic', 'standard', 'premium'].includes(priceType)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid price type'
                });
            }

            const dataset = await Dataset.findByPk(id);

            if (!dataset) {
                return res.status(404).json({
                    success: false,
                    error: 'Dataset not found'
                });
            }

            const priceMap = {
                basic: dataset.basic_price,
                standard: dataset.standard_price,
                premium: dataset.premium_price
            };

            const amount = priceMap[priceType];

            // TODO: Integrate with payment gateway
            // For now, just return payment info
            res.json({
                success: true,
                paymentId: `PAY_${Date.now()}`,
                datasetId: id,
                datasetName: dataset.name,
                priceType: priceType,
                amount: amount,
                redirectUrl: `http://localhost:3000/payment/PAY_${Date.now()}`
            });
        } catch (error) {
            console.error('Error purchasing dataset:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to purchase dataset',
                message: error.message
            });
        }
    },

    /**
     * POST /api/datasets - Tạo dataset mới (admin)
     */
    async createDataset(req, res) {
        try {
            const dataset = await Dataset.create(req.body);

            res.json({
                success: true,
                data: dataset
            });
        } catch (error) {
            console.error('Error creating dataset:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create dataset',
                message: error.message
            });
        }
    },

    /**
     * PUT /api/datasets/:id - Cập nhật dataset (admin)
     */
    async updateDataset(req, res) {
        try {
            const { id } = req.params;

            const dataset = await Dataset.findByPk(id);

            if (!dataset) {
                return res.status(404).json({
                    success: false,
                    error: 'Dataset not found'
                });
            }

            await dataset.update(req.body);

            res.json({
                success: true,
                data: dataset
            });
        } catch (error) {
            console.error('Error updating dataset:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update dataset',
                message: error.message
            });
        }
    },

    /**
     * DELETE /api/datasets/:id - Xóa dataset (admin)
     */
    async deleteDataset(req, res) {
        try {
            const { id } = req.params;

            const dataset = await Dataset.findByPk(id);

            if (!dataset) {
                return res.status(404).json({
                    success: false,
                    error: 'Dataset not found'
                });
            }

            await dataset.destroy();

            res.json({
                success: true,
                message: 'Dataset deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting dataset:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete dataset',
                message: error.message
            });
        }
    }
};

module.exports = datasetController;
