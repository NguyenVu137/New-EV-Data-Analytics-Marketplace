import db from '../models/index.js';
const { Sequelize } = require('sequelize');

const getTopInterestDatasets = async (limit = 10) => {
    try {
        const datasets = await db.Dataset.findAll({
            where: { status_code: 'APPROVED' },
            attributes: [
                'id',
                'title',
                'description',
                'category_code',
                'basicPrice',
                'standardPrice',
                'premiumPrice',
                [
                    Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM transactions
                        WHERE transactions.data_source_id = Dataset.id
                        AND transactions.payment_status_code = 'P2'
                    )`),
                    'purchaseCount'
                ],
                [
                    Sequelize.literal(`(
                        SELECT COALESCE(SUM(amount), 0)
                        FROM transactions
                        WHERE transactions.data_source_id = Dataset.id
                        AND transactions.payment_status_code = 'P2'
                    )`),
                    'totalRevenue'
                ],
                [
                    Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM audit_logs
                        WHERE audit_logs.data_source_id = Dataset.id
                        AND audit_logs.action_type_code = 'DOWNLOAD'
                    )`),
                    'downloadCount'
                ],
                [
                    Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM subscriptions
                        WHERE subscriptions.data_source_id = Dataset.id
                        AND subscriptions.status_code = 'ACTIVE'
                        AND subscriptions.end_date >= NOW()
                    )`),
                    'activeSubscriptions'
                ]
            ],
            include: [
                {
                    model: db.User,
                    as: 'provider',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: db.Allcode,
                    as: 'category',
                    attributes: ['key', 'valueVi', 'valueEn']
                }
            ],
            order: [
                [Sequelize.literal('purchaseCount'), 'DESC'],
                [Sequelize.literal('downloadCount'), 'DESC']
            ],
            limit: limit,
            raw: false,
            nest: true
        });

        return datasets;
    } catch (error) {
        console.error('getTopInterestDatasets error:', error);
        throw error;
    }
};

const getCategoryStatistics = async () => {
    try {
        const categories = await db.Allcode.findAll({
            where: { type: 'DATASET_CATEGORY' },
            attributes: ['key', 'valueVi', 'valueEn'],
            raw: true
        });

        const statsPromises = categories.map(async (category) => {
            const datasetCount = await db.Dataset.count({
                where: {
                    category_code: category.key,
                    status_code: 'APPROVED'
                }
            });

            const purchaseResult = await db.sequelize.query(`
                SELECT COUNT(*) as totalPurchases, COALESCE(SUM(t.amount), 0) as totalRevenue
                FROM transactions t
                INNER JOIN datasets d ON t.data_source_id = d.id
                WHERE d.category_code = :categoryCode
                AND t.payment_status_code = 'P2'
            `, {
                replacements: { categoryCode: category.key },
                type: db.Sequelize.QueryTypes.SELECT
            });

            return {
                category_code: category.key,
                category: category,
                datasetCount: datasetCount,
                totalPurchases: parseInt(purchaseResult[0].totalPurchases) || 0,
                totalRevenue: parseFloat(purchaseResult[0].totalRevenue) || 0
            };
        });

        const stats = await Promise.all(statsPromises);
        return stats.sort((a, b) => b.totalPurchases - a.totalPurchases);
    } catch (error) {
        console.error('getCategoryStatistics error:', error);
        throw error;
    }
};

const getPackageStatistics = async () => {
    try {
        const transactions = await db.Transaction.findAll({
            where: { payment_status_code: 'P2' },
            attributes: ['id', 'amount', 'data_source_id'],
            include: [
                {
                    model: db.Dataset,
                    as: 'dataset',
                    attributes: ['basicPrice', 'standardPrice', 'premiumPrice']
                }
            ],
            raw: true
        });

        const packageStats = {
            PK1: { package_type_code: 'PK1', count: 0, totalRevenue: 0 }, // Basic
            PK2: { package_type_code: 'PK2', count: 0, totalRevenue: 0 }, // Standard
            PK3: { package_type_code: 'PK3', count: 0, totalRevenue: 0 }  // Premium
        };

        transactions.forEach(tx => {
            const amount = parseFloat(tx.amount);
            const basicPrice = parseFloat(tx['dataset.basicPrice']) || 0;
            const standardPrice = parseFloat(tx['dataset.standardPrice']) || 0;
            const premiumPrice = parseFloat(tx['dataset.premiumPrice']) || 0;

            if (Math.abs(amount - premiumPrice) < 0.01 && premiumPrice > 0) {
                packageStats.PK3.count++;
                packageStats.PK3.totalRevenue += amount;
            } else if (Math.abs(amount - standardPrice) < 0.01 && standardPrice > 0) {
                packageStats.PK2.count++;
                packageStats.PK2.totalRevenue += amount;
            } else if (Math.abs(amount - basicPrice) < 0.01 && basicPrice > 0) {
                packageStats.PK1.count++;
                packageStats.PK1.totalRevenue += amount;
            } else {
                const diffBasic = Math.abs(amount - basicPrice);
                const diffStandard = Math.abs(amount - standardPrice);
                const diffPremium = Math.abs(amount - premiumPrice);

                const minDiff = Math.min(diffBasic, diffStandard, diffPremium);

                if (minDiff === diffPremium) {
                    packageStats.PK3.count++;
                    packageStats.PK3.totalRevenue += amount;
                } else if (minDiff === diffStandard) {
                    packageStats.PK2.count++;
                    packageStats.PK2.totalRevenue += amount;
                } else {
                    packageStats.PK1.count++;
                    packageStats.PK1.totalRevenue += amount;
                }
            }
        });

        const packageTypes = await db.Allcode.findAll({
            where: {
                type: 'PACKAGE_TYPE',
                key: ['PK1', 'PK2', 'PK3']
            },
            attributes: ['key', 'valueVi', 'valueEn'],
            raw: true
        });

        const result = Object.values(packageStats).map(stat => {
            const packageInfo = packageTypes.find(p => p.key === stat.package_type_code);
            return {
                package_type_code: stat.package_type_code,
                package_type: packageInfo || { key: stat.package_type_code, valueVi: 'Unknown', valueEn: 'Unknown' },
                count: stat.count,
                totalRevenue: stat.totalRevenue
            };
        });

        return result.sort((a, b) => b.count - a.count);
    } catch (error) {
        console.error('getPackageStatistics error:', error);
        throw error;
    }
};

const getMarketOverview = async () => {
    try {
        const totalDatasets = await db.Dataset.count({
            where: { status_code: 'APPROVED' }
        });

        const totalTransactions = await db.Transaction.count({
            where: { payment_status_code: 'P2' }
        });

        const revenueResult = await db.Transaction.findOne({
            where: { payment_status_code: 'P2' },
            attributes: [
                [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalRevenue']
            ],
            raw: true
        });

        const totalDownloads = await db.AuditLog.count({
            where: { action_type_code: 'DOWNLOAD' }
        });

        const activeSubscriptions = await db.Subscription.count({
            where: {
                status_code: 'ACTIVE',
                end_date: { [db.Sequelize.Op.gte]: new Date() }
            }
        });

        return {
            totalDatasets,
            totalTransactions,
            totalRevenue: parseFloat(revenueResult?.totalRevenue || 0),
            totalDownloads,
            activeSubscriptions
        };
    } catch (error) {
        console.error('getMarketOverview error:', error);
        throw error;
    }
};

const getTrendingStatistics = async (days = 7) => {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const dailyStats = await db.Transaction.findAll({
            where: {
                payment_status_code: 'P2',
                created_at: { [db.Sequelize.Op.gte]: startDate }
            },
            attributes: [
                [Sequelize.fn('DATE', Sequelize.col('created_at')), 'date'],
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'transactionCount'],
                [Sequelize.fn('SUM', Sequelize.col('amount')), 'revenue']
            ],
            group: [Sequelize.fn('DATE', Sequelize.col('created_at'))],
            order: [[Sequelize.fn('DATE', Sequelize.col('created_at')), 'ASC']],
            raw: true
        });

        return dailyStats;
    } catch (error) {
        console.error('getTrendingStatistics error:', error);
        throw error;
    }
};


const getFullMarketAnalytics = async () => {
    try {
        const [
            topDatasets,
            categoryStats,
            packageStats,
            marketOverview,
            trendingStats
        ] = await Promise.all([
            getTopInterestDatasets(10),
            getCategoryStatistics(),
            getPackageStatistics(),
            getMarketOverview(),
            getTrendingStatistics(7)
        ]);

        return {
            topDatasets,
            categoryStats,
            packageStats,
            marketOverview,
            trendingStats
        };
    } catch (error) {
        console.error('getFullMarketAnalytics error:', error);
        throw error;
    }
};

module.exports = {
    getTopInterestDatasets,
    getCategoryStatistics,
    getPackageStatistics,
    getMarketOverview,
    getTrendingStatistics,
    getFullMarketAnalytics
};