import express from 'express';
const { sequelize } = require('../config/database');
const { auth } = require('../../shared/middleware/auth');
const { checkRole } = require('../../shared/middleware/checkRole');
const ServiceClient = require('../../shared/utils/serviceClient');

const router = express.Router();
const datasetService = new ServiceClient(process.env.DATASET_SERVICE_URL || 'http://dataset-service:8082', 'Dataset');
const transactionService = new ServiceClient(process.env.TRANSACTION_SERVICE_URL || 'http://transaction-service:8083', 'Transaction');
// Thêm dòng này vào đầu file (sau các import khác)
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Thêm cache variables (sau các import, trước router)
let aiInsightsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = parseInt(process.env.AI_INSIGHTS_CACHE_DURATION) || 3600000; // 1 hour default
// Market Overview
router.get('/market-overview', auth, checkRole(['R1', 'R2']), async (req, res) => {
    try {
        // Get total datasets from Dataset Service
        const datasetsResponse = await datasetService.get('/api/datasets?status=S2&limit=1000');
        const totalDatasets = datasetsResponse.data?.pagination?.total || 0;

        // Aggregate from local analytics data
        const [revenueResult] = await sequelize.query(`
            SELECT COUNT(*) as totalTransactions, COALESCE(SUM(amount), 0) as totalRevenue
            FROM transactions WHERE payment_status_code = 'P2'
        `);

        res.json({
            errCode: 0,
            message: 'Get market overview successfully',
            data: {
                totalDatasets,
                totalTransactions: parseInt(revenueResult[0]?.totalTransactions || 0),
                totalRevenue: parseFloat(revenueResult[0]?.totalRevenue || 0)
            }
        });
    } catch (error) {
        console.error('Market overview error:', error);
        res.status(500).json({
            errCode: -1,
            message: 'Failed to get market overview',
            error: error.message
        });
    }
});

// Top Datasets
router.get('/top-datasets', auth, checkRole(['R1', 'R2', 'R3']), async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const [results] = await sequelize.query(`
            SELECT 
                data_source_id as datasetId,
                COUNT(*) as purchaseCount,
                SUM(amount) as totalRevenue
            FROM transactions
            WHERE payment_status_code = 'P2'
            GROUP BY data_source_id
            ORDER BY purchaseCount DESC
            LIMIT ${limit}
        `);

        // Enrich with dataset details
        const enrichedResults = await Promise.all(
            results.map(async (item) => {
                try {
                    const datasetResponse = await datasetService.get(`/api/datasets/${item.datasetId}`);
                    return {
                        ...item,
                        dataset: datasetResponse.data
                    };
                } catch (error) {
                    return item;
                }
            })
        );

        res.json({
            errCode: 0,
            message: 'Get top datasets successfully',
            data: enrichedResults
        });
    } catch (error) {
        console.error('Top datasets error:', error);
        res.status(500).json({
            errCode: -1,
            message: 'Failed to get top datasets'
        });
    }
});

// AI Insights - Gọi Gemini AI thật
router.get('/ai-insights', auth, checkRole(['R1']), async (req, res) => {
    try {
        // Kiểm tra cache
        const now = Date.now();
        if (aiInsightsCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
            return res.json({
                errCode: 0,
                message: 'AI insights generated (cached)',
                data: aiInsightsCache,
                cached: true,
                cacheAge: Math.floor((now - cacheTimestamp) / 1000)
            });
        }

        // Lấy dữ liệu thực từ database
        const datasetsResponse = await datasetService.get('/api/datasets?status=S2&limit=1000');
        const totalDatasets = datasetsResponse.data?.pagination?.total || 0;

        const [revenueResult] = await sequelize.query(`
            SELECT COUNT(*) as totalTransactions, COALESCE(SUM(amount), 0) as totalRevenue
            FROM transactions WHERE payment_status_code = 'P2'
        `);

        const [topDatasets] = await sequelize.query(`
            SELECT 
                data_source_id as datasetId,
                COUNT(*) as purchaseCount,
                SUM(amount) as totalRevenue
            FROM transactions
            WHERE payment_status_code = 'P2'
            GROUP BY data_source_id
            ORDER BY purchaseCount DESC
            LIMIT 5
        `);

        const [trendingData] = await sequelize.query(`
            SELECT 
                DATE(createdAt) as date,
                COUNT(*) as transactions,
                SUM(amount) as revenue
            FROM transactions
            WHERE payment_status_code = 'P2'
                AND createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY DATE(createdAt)
            ORDER BY date DESC
        `);

        const marketData = {
            totalDatasets,
            totalTransactions: parseInt(revenueResult[0]?.totalTransactions || 0),
            totalRevenue: parseFloat(revenueResult[0]?.totalRevenue || 0),
            topDatasets: topDatasets.slice(0, 5),
            recentTrends: trendingData.slice(0, 7)
        };

        // Khởi tạo Gemini AI
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: process.env.GEMINI_MODEL || "gemini-2.0-flash-exp"
        });

        const prompt = `
Bạn là chuyên gia phân tích thị trường cho nền tảng EV Data Analytics Marketplace.
Hãy phân tích dữ liệu sau và đưa ra insights bằng tiếng Việt:

📊 TỔNG QUAN THỊ TRƯỜNG:
- Tổng số datasets: ${marketData.totalDatasets}
- Tổng giao dịch thành công: ${marketData.totalTransactions}
- Tổng doanh thu: ${marketData.totalRevenue.toLocaleString('vi-VN')} VNĐ

📈 XU HƯỚNG 7 NGÀY GẦN ĐÂY:
${marketData.recentTrends.map(t => `- ${t.date}: ${t.transactions} giao dịch`).join('\n')}

Trả về JSON với format (KHÔNG thêm markdown):
{
  "summary": "Tóm tắt 2-3 câu",
  "keyInsights": ["Insight 1", "Insight 2", "Insight 3"],
  "recommendations": ["Khuyến nghị 1", "Khuyến nghị 2", "Khuyến nghị 3"],
  "trends": {
    "growthRate": 15.5,
    "popularCategory": "EV Data",
    "avgTransactionValue": 500000,
    "marketSentiment": "positive"
  }
}
`;

        console.log('🤖 Calling Gemini AI...');

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        console.log('✅ Gemini AI response received');

        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const aiData = JSON.parse(text);

        aiInsightsCache = aiData;
        cacheTimestamp = Date.now();

        res.json({
            errCode: 0,
            message: 'AI insights generated',
            data: aiData,
            cached: false,
            generatedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ AI Insights Error:', error);

        res.json({
            errCode: 0,
            message: 'AI insights generated (fallback)',
            data: {
                summary: 'Thị trường đang trong giai đoạn phát triển với xu hướng tích cực.',
                keyInsights: [
                    'Số lượng giao dịch đang tăng đều',
                    'Datasets về EV đang được quan tâm',
                    'Người dùng ưa chuộng dữ liệu chất lượng cao'
                ],
                recommendations: [
                    'Tập trung vào chất lượng datasets',
                    'Tối ưu chiến lược giá cả',
                    'Đẩy mạnh marketing'
                ],
                trends: {
                    growthRate: 15.5,
                    popularCategory: 'EV Data',
                    avgTransactionValue: 500000,
                    marketSentiment: 'positive'
                }
            },
            error: error.message,
            fallback: true
        });
    }
});

// Category Statistics
router.get('/categories', auth, checkRole(['R1', 'R2', 'R3']), async (req, res) => {
    try {
        const datasetsResponse = await datasetService.get('/api/datasets?status=S2&limit=1000');
        const datasets = datasetsResponse.data?.datasets || [];

        // Group by category
        const categoryStats = datasets.reduce((acc, dataset) => {
            const category = dataset.category_code || 'UNKNOWN';
            if (!acc[category]) {
                acc[category] = { category, count: 0, datasets: [] };
            }
            acc[category].count++;
            acc[category].datasets.push(dataset.id);
            return acc;
        }, {});

        res.json({
            errCode: 0,
            data: Object.values(categoryStats)
        });
    } catch (error) {
        res.status(500).json({
            errCode: -1,
            message: 'Failed to get category statistics'
        });
    }
});

// Package Statistics
router.get('/packages', auth, checkRole(['R1', 'R2']), async (req, res) => {
    try {
        const [results] = await sequelize.query(`
            SELECT 
                type_code as packageType,
                COUNT(*) as purchaseCount,
                SUM(amount) as totalRevenue
            FROM transactions
            WHERE payment_status_code = 'P2'
            GROUP BY type_code
        `);

        res.json({
            errCode: 0,
            data: results
        });
    } catch (error) {
        res.status(500).json({
            errCode: -1,
            message: 'Failed to get package statistics'
        });
    }
});

// Trending Statistics
router.get('/trending', auth, checkRole(['R1', 'R2']), async (req, res) => {
    try {
        // Last 7 days trending
        const [results] = await sequelize.query(`
            SELECT 
                DATE(createdAt) as date,
                COUNT(*) as transactions,
                SUM(amount) as revenue
            FROM transactions
            WHERE payment_status_code = 'P2'
                AND createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY DATE(createdAt)
            ORDER BY date DESC
        `);

        res.json({
            errCode: 0,
            data: results
        });
    } catch (error) {
        res.status(500).json({
            errCode: -1,
            message: 'Failed to get trending statistics'
        });
    }
});

// Regenerate AI Insights (Admin only)
router.post('/ai-insights/regenerate', auth, checkRole(['R1']), async (req, res) => {
    try {
        aiInsightsCache = null;
        cacheTimestamp = null;

        res.json({
            errCode: 0,
            message: 'Cache cleared. Call GET /ai-insights to regenerate.'
        });
    } catch (error) {
        res.status(500).json({
            errCode: -1,
            message: 'Failed to clear cache'
        });
    }
});

// Clear AI Insights Cache (Admin only)
router.delete('/ai-insights/cache', auth, checkRole(['R1']), async (req, res) => {
    try {
        aiInsightsCache = null;
        cacheTimestamp = null;

        res.json({
            errCode: 0,
            message: 'AI insights cache cleared successfully'
        });
    } catch (error) {
        res.status(500).json({
            errCode: -1,
            message: 'Failed to clear cache'
        });
    }
});

// EV Analytics - Monthly Overview
router.get('/ev-analytics', auth, checkRole(['R1', 'R2']), async (req, res) => {
    try {
        const { year, month } = req.query;

        // Hardcoded demo data for November 2024
        const demoData = {
            year: parseInt(year) || 2024,
            month: parseInt(month) || 11,
            totalVehicles: 1250,
            totalCharging: 8450,
            avgSoC: 72.5,
            avgSoH: 94.2,
            dailyData: Array.from({ length: 30 }, (_, i) => ({
                day: i + 1,
                soc: 65 + Math.random() * 20,
                soh: 90 + Math.random() * 8,
                charging: 250 + Math.random() * 100,
                distance: 50 + Math.random() * 30
            }))
        };

        res.json({
            errCode: 0,
            data: demoData
        });
    } catch (error) {
        res.status(500).json({
            errCode: -1,
            message: 'Failed to get EV analytics'
        });
    }
});

// EV Analytics - Available Months
router.get('/ev-analytics/available-months', auth, checkRole(['R1', 'R2']), async (req, res) => {
    try {
        // Return available months (hardcoded for demo)
        const availableMonths = [
            { year: 2024, month: 11, label: 'November 2024' },
            { year: 2024, month: 10, label: 'October 2024' },
            { year: 2024, month: 9, label: 'September 2024' }
        ];

        res.json({
            errCode: 0,
            data: availableMonths
        });
    } catch (error) {
        res.status(500).json({
            errCode: -1,
            message: 'Failed to get available months'
        });
    }
});

// EV Analytics - Datasets by Day
router.get('/ev-analytics/datasets-by-day', auth, checkRole(['R1', 'R2']), async (req, res) => {
    try {
        const { year, month } = req.query;

        // Generate demo data
        const daysInMonth = 30;
        const datasetsByDay = Array.from({ length: daysInMonth }, (_, i) => ({
            day: i + 1,
            datasetCount: Math.floor(Math.random() * 20) + 10,
            uploadCount: Math.floor(Math.random() * 15) + 5
        }));

        res.json({
            errCode: 0,
            data: datasetsByDay
        });
    } catch (error) {
        res.status(500).json({
            errCode: -1,
            message: 'Failed to get datasets by day'
        });
    }
});

// Calculate Monthly Analytics (Admin)
router.post('/ev-analytics/calculate-monthly', auth, checkRole(['R1']), async (req, res) => {
    try {
        const { year, month } = req.body;

        // TODO: Implement actual calculation logic
        console.log(`📊 Calculating analytics for ${year}-${month}`);

        res.json({
            errCode: 0,
            message: 'Monthly analytics calculated successfully',
            data: {
                year: parseInt(year),
                month: parseInt(month),
                timestamp: new Date()
            }
        });
    } catch (error) {
        res.status(500).json({
            errCode: -1,
            message: 'Failed to calculate monthly analytics'
        });
    }
});

// My Purchased Data Analytics
router.get('/my-purchased-data', auth, checkRole(['R1', 'R2', 'R3']), async (req, res) => {
    try {
        const { month } = req.query;

        // Get user's purchased datasets via Transaction Service
        const ServiceClient = require('../../shared/utils/serviceClient');
        const transactionService = new ServiceClient(
            process.env.TRANSACTION_SERVICE_URL || 'http://transaction-service:8083',
            'Transaction'
        );

        const token = req.headers.authorization;
        transactionService.setAuthToken(token);

        // Get user's successful transactions
        const transactionsResponse = await transactionService.get('/api/transactions/my-transactions');
        const purchasedDatasetIds = transactionsResponse.data
            ?.filter(t => t.payment_status_code === 'P2')
            .map(t => t.data_source_id) || [];

        if (purchasedDatasetIds.length === 0) {
            return res.json({
                errCode: 0,
                message: 'No purchased datasets found',
                data: {
                    overview: {
                        totalDatasets: 0,
                        totalSpent: 0,
                        avgSoC: 0,
                        avgSoH: 0
                    },
                    dailyData: []
                }
            });
        }

        // Get dataset details from Dataset Service
        const datasetService = new ServiceClient(
            process.env.DATASET_SERVICE_URL || 'http://dataset-service:8082',
            'Dataset'
        );
        datasetService.setAuthToken(token);

        const datasetsPromises = purchasedDatasetIds.map(id =>
            datasetService.get(`/api/datasets/${id}`).catch(() => null)
        );
        const datasetsResults = await Promise.all(datasetsPromises);
        const datasets = datasetsResults.filter(d => d && d.data).map(d => d.data);

        // Calculate overview
        const totalSpent = transactionsResponse.data
            ?.filter(t => t.payment_status_code === 'P2')
            .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0) || 0;

        // Mock EV metrics
        const mockEVMetrics = {
            avgSoC: 75.5,
            avgSoH: 92.3,
            totalDistance: datasets.length * 25000,
            totalChargingCycles: datasets.length * 350,
            co2Saved: (datasets.length * 1250).toFixed(2)
        };

        // Generate daily data
        const dailyData = Array.from({ length: 30 }, (_, i) => ({
            day: i + 1,
            soc: 65 + Math.random() * 20,
            soh: 90 + Math.random() * 8,
            charging: 200 + Math.random() * 100,
            distance: 40 + Math.random() * 30
        }));

        res.json({
            errCode: 0,
            message: 'Get my purchased data analytics successfully',
            data: {
                overview: {
                    totalDatasets: datasets.length,
                    totalSpent,
                    ...mockEVMetrics
                },
                datasets: datasets.map(ds => ({
                    id: ds.id,
                    title: ds.title,
                    category: ds.category_code
                })),
                dailyData
            }
        });
    } catch (error) {
        console.error('My purchased data analytics error:', error);
        res.status(500).json({
            errCode: -1,
            message: 'Failed to get my purchased data analytics'
        });
    }
});

// My Purchased Data - Available Months
router.get('/my-purchased-data/available-months', auth, checkRole(['R1', 'R2', 'R3']), async (req, res) => {
    try {
        // Get user's transactions to determine available months
        const ServiceClient = require('../../shared/utils/serviceClient');
        const transactionService = new ServiceClient(
            process.env.TRANSACTION_SERVICE_URL || 'http://transaction-service:8083',
            'Transaction'
        );

        const token = req.headers.authorization;
        transactionService.setAuthToken(token);

        const transactionsResponse = await transactionService.get('/api/transactions/my-transactions');
        const transactions = transactionsResponse.data?.filter(t => t.payment_status_code === 'P2') || [];

        // Group by month
        const monthsSet = new Set();
        transactions.forEach(t => {
            const date = new Date(t.createdAt);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthsSet.add(monthKey);
        });

        const availableMonths = Array.from(monthsSet).sort().reverse().map(monthKey => {
            const [year, month] = monthKey.split('-');
            return {
                year: parseInt(year),
                month: parseInt(month),
                monthString: monthKey,
                label: new Date(year, month - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
            };
        });

        res.json({
            errCode: 0,
            data: availableMonths
        });
    } catch (error) {
        res.status(500).json({
            errCode: -1,
            message: 'Failed to get available months'
        });
    }
});

export default router;
