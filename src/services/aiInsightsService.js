import db from '../models/index.js';
const { Sequelize } = require('sequelize');
const fetch = require('node-fetch');

const getAnalyticsDataForAI = async () => {
    try {
        console.log('📊 Collecting data for AI analysis...');

        // 1. Top 10 datasets được quan tâm nhất
        const topDatasets = await db.Dataset.findAll({
            where: { status_code: 'APPROVED' },
            attributes: [
                'id', 'title', 'description', 'category_code',
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
                        SELECT COUNT(*)
                        FROM audit_logs
                        WHERE audit_logs.data_source_id = Dataset.id
                        AND audit_logs.action_type_code = 'DOWNLOAD'
                    )`),
                    'downloadCount'
                ]
            ],
            include: [{
                model: db.Allcode,
                as: 'category',
                attributes: ['valueVi', 'valueEn']
            }],
            order: [[Sequelize.literal('purchaseCount'), 'DESC']],
            limit: 10,
            raw: false,
            nest: true
        });

        // 2. Thống kê theo category
        const categoryStats = await db.sequelize.query(`
            SELECT 
                d.category_code,
                ac.valueVi as category_name,
                COUNT(DISTINCT d.id) as dataset_count,
                COUNT(t.id) as total_purchases,
                COALESCE(SUM(t.amount), 0) as total_revenue
            FROM datasets d
            LEFT JOIN allcodes ac ON d.category_code = ac.key AND ac.type = 'DATASET_CATEGORY'
            LEFT JOIN transactions t ON d.id = t.data_source_id AND t.payment_status_code = 'P2'
            WHERE d.status_code = 'APPROVED'
            GROUP BY d.category_code, ac.valueVi
            ORDER BY total_purchases DESC
        `, { type: Sequelize.QueryTypes.SELECT });

        // 3. Xu hướng giao dịch 30 ngày gần nhất
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentTransactions = await db.Transaction.findAll({
            where: {
                payment_status_code: 'P2',
                created_at: { [db.Sequelize.Op.gte]: thirtyDaysAgo }
            },
            attributes: [
                [Sequelize.fn('DATE', Sequelize.col('created_at')), 'date'],
                [Sequelize.fn('COUNT', Sequelize.col('Transaction.id')), 'count']
            ],
            group: [Sequelize.fn('DATE', Sequelize.col('created_at'))],
            order: [[Sequelize.fn('DATE', Sequelize.col('created_at')), 'ASC']],
            raw: true
        });

        // 4. Phân bố package type
        const packageDistribution = await db.sequelize.query(`
            SELECT 
                CASE 
                    WHEN ABS(t.amount - d.premiumPrice) < 0.01 THEN 'Premium'
                    WHEN ABS(t.amount - d.standardPrice) < 0.01 THEN 'Standard'
                    ELSE 'Basic'
                END as package_type,
                COUNT(*) as count,
                COALESCE(SUM(t.amount), 0) as revenue
            FROM transactions t
            INNER JOIN datasets d ON t.data_source_id = d.id
            WHERE t.payment_status_code = 'P2'
            GROUP BY package_type
            ORDER BY count DESC
        `, { type: Sequelize.QueryTypes.SELECT });

        // 5. Tổng quan thị trường
        const marketOverview = {
            totalDatasets: await db.Dataset.count({ where: { status_code: 'APPROVED' } }),
            totalTransactions: await db.Transaction.count({ where: { payment_status_code: 'P2' } }),
            totalDownloads: await db.AuditLog.count({ where: { action_type_code: 'DOWNLOAD' } }),
            activeSubscriptions: await db.Subscription.count({
                where: {
                    status_code: 'ACTIVE',
                    end_date: { [db.Sequelize.Op.gte]: new Date() }
                }
            })
        };

        // 6. Tính tổng doanh thu
        const revenueResult = await db.Transaction.findOne({
            where: { payment_status_code: 'P2' },
            attributes: [[Sequelize.fn('SUM', Sequelize.col('amount')), 'totalRevenue']],
            raw: true
        });
        marketOverview.totalRevenue = parseFloat(revenueResult?.totalRevenue || 0);

        console.log('✅ Data collection completed');

        return {
            topDatasets,
            categoryStats,
            recentTransactions,
            packageDistribution,
            marketOverview
        };
    } catch (error) {
        console.error('❌ getAnalyticsDataForAI error:', error);
        throw error;
    }
};

const buildAIPrompt = (analyticsData) => {
    const { topDatasets, categoryStats, recentTransactions, packageDistribution, marketOverview } = analyticsData;

    // Format top datasets
    const topDatasetsText = topDatasets
        .map((d, i) => `${i + 1}. ${d.title} (${d.category?.valueVi || 'N/A'}) - ${d.purchaseCount} lượt mua, ${d.downloadCount} lượt tải`)
        .join('\n');

    // Format category stats
    const categoryText = categoryStats
        .map(c => `- ${c.category_name}: ${c.dataset_count} datasets, ${c.total_purchases} lượt mua, ${parseFloat(c.total_revenue || 0).toLocaleString('vi-VN')} VNĐ`)
        .join('\n');

    // Format package distribution
    const packageText = packageDistribution
        .map(p => `- Gói ${p.package_type}: ${p.count} lượt mua, ${parseFloat(p.revenue || 0).toLocaleString('vi-VN')} VNĐ`)
        .join('\n');

    // Format recent trend
    const last7Days = recentTransactions.slice(-7);
    const trendText = last7Days.length > 0
        ? last7Days.map(t => `${t.date}: ${t.count} giao dịch`).join(', ')
        : 'Chưa có dữ liệu';

    const prompt = `Bạn là chuyên gia phân tích dữ liệu và xu hướng thị trường xe điện (EV) tại Việt Nam.

**THÔNG TIN THỊ TRƯỜNG:**

📊 **Tổng quan:**
- Tổng số datasets: ${marketOverview.totalDatasets}
- Tổng giao dịch: ${marketOverview.totalTransactions}
- Tổng lượt tải: ${marketOverview.totalDownloads}
- Subscription đang hoạt động: ${marketOverview.activeSubscriptions}
- Tổng doanh thu: ${marketOverview.totalRevenue.toLocaleString('vi-VN')} VNĐ

🏆 **Top datasets được quan tâm:**
${topDatasetsText}

📂 **Phân loại theo danh mục:**
${categoryText}

📦 **Phân bố gói dịch vụ:**
${packageText}

📈 **Xu hướng 7 ngày gần nhất:**
${trendText}

---

**YÊU CẦU PHÂN TÍCH:**

Hãy phân tích dữ liệu trên và đưa ra báo cáo với các phần sau:

## 1. 🔍 Xu hướng thị trường EV hiện tại
(2-3 điểm chính dựa trên dữ liệu, giải thích vì sao category/dataset đó được quan tâm)

## 2. 💡 Cơ hội kinh doanh
(2-3 gợi ý cụ thể cho nhà cung cấp dữ liệu về loại dataset nên phát triển)

## 3. 🔮 Dự đoán xu hướng tương lai
(Dự đoán 6-12 tháng tới dựa trên pattern hiện tại)

## 4. ✅ Khuyến nghị hành động
- **Cho Providers:** (1-2 khuyến nghị)
- **Cho Consumers:** (1-2 khuyến nghị)

---

**LƯU Ý:**
- Trả lời BẰNG TIẾNG VIỆT
- Sử dụng emoji phù hợp (✅ ⚡ 📊 💰 🎯 🚀)
- Ngắn gọn, súc tích, dễ hiểu
- Dựa trên DỮ LIỆU THỰC TẾ được cung cấp
- Sử dụng bullet points để dễ đọc`;

    return prompt;
};

const callGeminiAPI = async (prompt) => {
    try {
        const GOOGLE_GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
        const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

        if (!GOOGLE_GEMINI_API_KEY) {
            throw new Error('GOOGLE_GEMINI_API_KEY not found. Please add it to .env file');
        }

        console.log(`🤖 Calling Gemini API (${GEMINI_MODEL})...`);

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GOOGLE_GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 8192,
                        topP: 0.95,
                        topK: 40
                    }
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('📦 Full API Response:', JSON.stringify(data, null, 2));
        console.log('🔍 Candidates:', data.candidates);
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiResponse) {
            throw new Error('No response from Gemini API');
        }

        console.log('✅ Gemini API call successful');
        return aiResponse;

    } catch (error) {
        console.error('❌ callGeminiAPI error:', error);
        throw error;
    }
};

const generateAIInsights = async () => {
    try {
        console.log('🚀 Starting AI insights generation...');

        // 1. Collect data
        const analyticsData = await getAnalyticsDataForAI();

        // 2. Build prompt
        const prompt = buildAIPrompt(analyticsData);

        // 3. Call AI
        const aiResponse = await callGeminiAPI(prompt);

        // 4. Return structured result
        const result = {
            insights: aiResponse,
            generatedAt: new Date(),
            dataSnapshot: {
                totalDatasets: analyticsData.marketOverview.totalDatasets,
                totalTransactions: analyticsData.marketOverview.totalTransactions,
                totalDownloads: analyticsData.marketOverview.totalDownloads,
                totalRevenue: analyticsData.marketOverview.totalRevenue,
                topCategories: analyticsData.categoryStats.slice(0, 3).map(c => c.category_name)
            }
        };

        console.log('✅ AI insights generated successfully');
        return result;

    } catch (error) {
        console.error('❌ generateAIInsights error:', error);
        throw error;
    }
};

let cachedInsights = null;
let cacheExpiry = null;
const CACHE_DURATION = parseInt(process.env.AI_INSIGHTS_CACHE_DURATION) || 3600000; // 1 hour

const getAIInsights = async (forceRefresh = false) => {
    try {
        const now = Date.now();

        // Check cache
        if (!forceRefresh && cachedInsights && cacheExpiry && now < cacheExpiry) {
            console.log('📦 Returning cached AI insights');
            return {
                ...cachedInsights,
                cached: true,
                cacheExpiresIn: Math.floor((cacheExpiry - now) / 1000 / 60) // minutes
            };
        }

        // Generate new insights
        console.log('🔄 Cache expired or force refresh - generating new insights');
        const insights = await generateAIInsights();

        // Update cache
        cachedInsights = insights;
        cacheExpiry = now + CACHE_DURATION;

        return {
            ...insights,
            cached: false
        };

    } catch (error) {
        console.error('❌ getAIInsights error:', error);

        // Fallback to stale cache if available
        if (cachedInsights) {
            console.warn('⚠️ Returning stale cached data due to error');
            return {
                ...cachedInsights,
                cached: true,
                stale: true,
                error: error.message
            };
        }

        throw error;
    }
};


const clearCache = () => {
    cachedInsights = null;
    cacheExpiry = null;
    console.log('🗑️ AI insights cache cleared');
};

module.exports = {
    getAnalyticsDataForAI,
    generateAIInsights,
    getAIInsights,
    clearCache
};