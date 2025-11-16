const db = require("../models/index");
const { Op } = require('sequelize');

// Flag để tránh tính toán 2 lần cùng lúc
let isCalculating = false;

// Tính toán analytics hàng tháng và lưu vào database
async function calculateMonthlyAnalytics() {
    try {
        if (isCalculating) {
            console.log('[Analytics Monthly] Calculation already in progress, skipping...');
            return { 
                success: true, 
                message: 'Calculation already in progress',
                skipped: true 
            };
        }

        isCalculating = true;
        console.log('[Analytics Monthly] Starting calculation...');

        // CHECK AND CLEAR OLD ANALYTICS FIRST
        const oldAnalyticsCount = await db.Analytics.count();
        const oldAnalyticsMonthCount = await db.AnalyticsMonth.count();
        
        console.log(`[Analytics Monthly] Checking old data: ${oldAnalyticsCount} analytics records, ${oldAnalyticsMonthCount} months`);
        
        if (oldAnalyticsCount > 0) {
            console.log('[Analytics Monthly] Clearing old analytics data...');
            await db.Analytics.destroy({ where: {} });
            console.log('[Analytics Monthly] Analytics cleared');
        }
        
        if (oldAnalyticsMonthCount > 0) {
            console.log('[Analytics Monthly] Clearing old analytics_months data...');
            await db.AnalyticsMonth.destroy({ where: {} });
            console.log('[Analytics Monthly] AnalyticsMonth cleared');
        }

        // Get all datasets with required fields
        const allDatasets = await db.Dataset.findAll({
            attributes: [
                'id', 'soc', 'soh', 'co2_saved', 'charging_frequency',
                'charging_time', 'total_distance', 'createdAt'
            ],
            where: {
                [Op.and]: [
                    { soc: { [Op.not]: null } },
                    { soh: { [Op.not]: null } }
                ]
            },
            order: [['createdAt', 'ASC']],
            raw: true
        });

        if (allDatasets.length === 0) {
            console.log('[Analytics Monthly] No datasets found');
            return { success: true, message: 'No datasets to calculate' };
        }

        console.log(`[Analytics Monthly] Found ${allDatasets.length} dataset records`);

        // Group datasets by month_string (YYYY-MM)
        const groupedByMonth = {};
        allDatasets.forEach(dataset => {
            const date = new Date(dataset.createdAt);
            const monthString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!groupedByMonth[monthString]) {
                groupedByMonth[monthString] = [];
            }
            groupedByMonth[monthString].push(dataset);
        });

        console.log(`[Analytics Monthly] Found ${Object.keys(groupedByMonth).length} unique months`);

        // Sort months chronologically
        const sortedMonths = Object.keys(groupedByMonth).sort();

        // Calculate analytics for each month
        for (let i = 0; i < sortedMonths.length; i++) {
            const monthString = sortedMonths[i];
            const datasets = groupedByMonth[monthString];
            const [year, month] = monthString.split('-').map(Number);

            // Calculate metrics for this month
            const totals = datasets.reduce((acc, d) => {
                return {
                    soc: acc.soc + (parseFloat(d.soc) || 0),
                    soh: acc.soh + (parseFloat(d.soh) || 0),
                    co2_saved: acc.co2_saved + (parseFloat(d.co2_saved) || 0),
                    charges: acc.charges + (parseInt(d.charging_frequency) || 0)
                };
            }, { soc: 0, soh: 0, co2_saved: 0, charges: 0 });

            const metrics = {
                average_soc: totals.soc / datasets.length,
                average_soh: totals.soh / datasets.length,
                co2_saved_percent: totals.co2_saved / datasets.length,
                total_charges: totals.charges,
                data_count: datasets.length
            };

            // Tao hoặc tìm bản ghi AnalyticsMonth
            const [monthRecord] = await db.AnalyticsMonth.findOrCreate({
                where: { month_string: monthString },
                defaults: {
                    month: month,
                    year: year,
                    month_string: monthString
                }
            });

            // Tạo bản ghi Analytics
            await db.Analytics.create({
                month_id: monthRecord.id,
                month_string: monthString,
                average_soc: metrics.average_soc,
                average_soh: metrics.average_soh,
                co2_saved_percent: metrics.co2_saved_percent,
                total_charges: metrics.total_charges,
                data_count: metrics.data_count
            });

            console.log(`[Analytics Monthly] Month ${monthString}: ${metrics.data_count} records`);
        }

        const totalRecords = await db.Analytics.count();
        console.log(`[Analytics Monthly] Completed! Total analytics records: ${totalRecords}`);

        isCalculating = false;

        return {
            success: true,
            message: 'Monthly analytics calculated successfully',
            totalMonths: sortedMonths.length,
            totalRecords: totalRecords
        };

    } catch (error) {
        isCalculating = false;
        console.error('[Analytics Monthly] Error:', error);
        throw error;
    }
}

// Lấy các tháng có dữ liệu từ bảng Analytics
async function getAvailableMonths() {
    try {
        // Lấy tất cả tháng UNIQUE từ bảng Analytics
        const months = await db.Analytics.findAll({
            attributes: ['month_string'],
            where: { month_string: { [Op.not]: null } },
            group: ['month_string'],
            order: [['month_string', 'DESC']],
            raw: true,
            subQuery: false
        });

        console.log('[Analytics Service] Found unique months from Analytics table:', months.length);
        
        if (months.length === 0) {
            // Fallback: Lấy từ bảng AnalyticsMonth nếu Analytics trống
            const monthsFromTable = await db.AnalyticsMonth.findAll({
                order: [['month_string', 'DESC']],
                raw: true
            });
            
            console.log('[Analytics Service] Fallback: Found months from analytics_months:', monthsFromTable.length);
            
            return monthsFromTable.map(m => ({
                month_string: m.month_string,
                label: `Tháng ${m.month}/${m.year}`,
                month: m.month,
                year: m.year
            }));
        }

        // Parse month_string (YYYY-MM) để lấy month và year
        return months.map(m => {
            const [year, month] = m.month_string.split('-').map(Number);
            return {
                month_string: m.month_string,
                label: `Tháng ${month}/${year}`,
                month: month,
                year: year
            };
        });
    } catch (error) {
        console.error('[Analytics Service] Error getting available months:', error);
        return [];
    }
}

// Nhóm dữ liệu theo ngày trong một tháng
function groupDatasetsByDay(datasets) {
    const groupedByDay = {};
    
    datasets.forEach(dataset => {
        const dateStr = new Date(dataset.createdAt).toISOString().split('T')[0];
        if (!groupedByDay[dateStr]) {
            groupedByDay[dateStr] = [];
        }
        groupedByDay[dateStr].push(dataset);
    });

    const timestamps = Object.keys(groupedByDay).sort();
    
    // Tính giá trị trung bình cho mỗi ngày
    const socValues = timestamps.map(date => {
        const dayData = groupedByDay[date];
        const avgSoc = dayData.reduce((sum, item) => sum + (parseFloat(item.soc) || 0), 0) / dayData.length;
        return Math.round(avgSoc);
    });

    const sohValues = timestamps.map(date => {
        const dayData = groupedByDay[date];
        const avgSoh = dayData.reduce((sum, item) => sum + (parseFloat(item.soh) || 0), 0) / dayData.length;
        return Math.round(avgSoh);
    });

    const chargeValues = timestamps.map(date => {
        const dayData = groupedByDay[date];
        return dayData.reduce((sum, item) => sum + (parseInt(item.charging_frequency) || 0), 0);
    });

    return {
        timestamps,
        socValues,
        sohValues,
        chargeValues
    };
}

// Tính phần trăm xu hướng giữa hai giá trị
// Công thức: ((giá trị hiện tại - giá trị trước) / giá trị trước) * 100
function calculateTrendPercentage(previousValue, currentValue) {
    if (!previousValue || previousValue === 0) return 0;
    return ((currentValue - previousValue) / previousValue) * 100;
}

// Xác định trạng thái xu hướng dựa trên phần trăm
function calculateTrendArrow(trendPercentage) {
    if (trendPercentage > 0) return 'up';
    if (trendPercentage < 0) return 'down';
    return 'flat';
}

// Export các hàm
module.exports = { 
    calculateMonthlyAnalytics,
    groupDatasetsByDay, 
    getAvailableMonths,
    calculateTrendPercentage,
    calculateTrendArrow
};
