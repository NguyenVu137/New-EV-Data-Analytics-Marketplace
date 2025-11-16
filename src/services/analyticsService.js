const db = require("../models/index");
const { Op } = require('sequelize');

// Tính toán các chỉ số từ một tập hợp dữ liệu
function calculateMetrics(datasets) {
    if (!datasets || datasets.length === 0) {
        return {
            average_soc: 0,
            average_soh: 0,
            total_co2_saved: 0,
            total_charges: 0,
            average_charging_time: 0,
            total_distance: 0,
            data_count: 0
        };
    }

    //Tính tổng các giá trị
    const totals = datasets.reduce((acc, d) => {
        return {
            soc: acc.soc + (parseFloat(d.soc) || 0),
            soh: acc.soh + (parseFloat(d.soh) || 0),
            co2_saved: acc.co2_saved + (parseFloat(d.co2_saved) || 0),
            charges: acc.charges + (parseInt(d.charging_frequency) || 0),
            charging_time: acc.charging_time + (parseInt(d.charging_time) || 0),
            distance: acc.distance + (parseFloat(d.total_distance) || 0)
        };
    }, { soc: 0, soh: 0, co2_saved: 0, charges: 0, charging_time: 0, distance: 0 });

    // Tính toán trung bình và tổng
    return {
        average_soc: totals.soc / datasets.length,
        average_soh: totals.soh / datasets.length,
        total_co2_saved: totals.co2_saved,
        total_charges: totals.charges,
        average_charging_time: datasets.length > 0 ? totals.charging_time / datasets.length : 0,
        total_distance: totals.distance,
        data_count: datasets.length
    };
}

// Tính toán analytics hàng tháng và lưu vào database
async function calculateMonthlyAnalytics() {
    try {
        console.log('[Analytics Monthly] Starting calculation...');

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

        // Clear old analytics
        await db.Analytics.destroy({ where: {} });
        await db.AnalyticsMonth.destroy({ where: {} });

        // Calculate analytics for each month
        for (let i = 0; i < sortedMonths.length; i++) {
            const monthString = sortedMonths[i];
            const datasets = groupedByMonth[monthString];
            const [year, month] = monthString.split('-').map(Number);

            // Calculate metrics for this month
            const metrics = calculateMetrics(datasets);

            // Calculate trends (compare with previous month)
            let trends = {
                soc_trend: 0,
                soh_trend: 0,
                co2_trend: 0,
                charges_trend: 0,
                distance_trend: 0
            };

            if (i > 0) {
                const previousMonthString = sortedMonths[i - 1];
                const previousDatasets = groupedByMonth[previousMonthString];
                const previousMetrics = calculateMetrics(previousDatasets);

                // Tính phần trăm xu hướng
                trends.soc_trend = calculateTrendPercentage(previousMetrics.average_soc, metrics.average_soc);
                trends.soh_trend = calculateTrendPercentage(previousMetrics.average_soh, metrics.average_soh);
                trends.co2_trend = calculateTrendPercentage(previousMetrics.total_co2_saved, metrics.total_co2_saved);
                trends.charges_trend = calculateTrendPercentage(previousMetrics.total_charges, metrics.total_charges);
                trends.distance_trend = calculateTrendPercentage(previousMetrics.total_distance, metrics.total_distance);
            }

            // Tao hoặc tìm bản ghi AnalyticsMonth
            const [monthRecord] = await db.AnalyticsMonth.findOrCreate({
                where: { month_string: monthString },
                defaults: {
                    month: month,
                    year: year,
                    month_string: monthString
                }
            });

            // Tạo bản ghi Analytics với xu hướng
            await db.Analytics.create({
                timestamp: new Date(),
                month_id: monthRecord.id,
                month_string: monthString,
                average_soc: metrics.average_soc,
                average_soh: metrics.average_soh,
                total_co2_saved: metrics.total_co2_saved,
                total_charges: metrics.total_charges,
                average_charging_time: metrics.average_charging_time,
                total_distance: metrics.total_distance,
                data_count: metrics.data_count,
                soc_trend: trends.soc_trend,
                soh_trend: trends.soh_trend,
                co2_trend: trends.co2_trend,
                charges_trend: trends.charges_trend,
                distance_trend: trends.distance_trend,
                period: 'monthly'
            });

            console.log(`[Analytics Monthly] ✅ Month ${monthString}: ${metrics.data_count} records, Trends: SoC${trends.soc_trend.toFixed(2)}%, Co2${trends.co2_trend.toFixed(2)}%`);
        }

        const totalRecords = await db.Analytics.count();
        console.log(`[Analytics Monthly] ✅ Completed! Total analytics records: ${totalRecords}`);

        return {
            success: true,
            message: 'Monthly analytics calculated successfully',
            totalMonths: sortedMonths.length,
            totalRecords: totalRecords
        };

    } catch (error) {
        console.error('[Analytics Monthly] Error:', error);
        throw error;
    }
}

// Lấy các tháng có dữ liệu từ bảng analytics_months
async function getAvailableMonths() {
    try {
        // Lấy từ bảng analytics_months
        const months = await db.AnalyticsMonth.findAll({
            order: [['month_string', 'DESC']],
            raw: true
        });

        console.log('[Analytics Service] Found months from analytics_months:', months.length);
        
        return months.map(m => ({
            month_string: m.month_string,
            label: `Tháng ${m.month}/${m.year}`,
            month: m.month,
            year: m.year
        }));
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

// Xác định mũi tên xu hướng dựa trên phần trăm
function calculateTrendArrow(trendPercentage) {
    if (trendPercentage > 0) return '↑';
    if (trendPercentage < 0) return '↓';
    return '→';
}

// Export các hàm
module.exports = { 
    calculateMonthlyAnalytics,
    groupDatasetsByDay, 
    getAvailableMonths,
    calculateTrendPercentage,
    calculateTrendArrow
};
