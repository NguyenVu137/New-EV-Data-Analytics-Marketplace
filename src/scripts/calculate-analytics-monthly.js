const db = require("../models/index");
const { Op } = require("sequelize");

/**
 * Calculate Analytics by Month with Trend Comparison
 * Groups datasets by month, calculates metrics, and compares with previous month
 */
async function calculateMonthlyAnalytics() {
    try {
        console.log('[Analytics Monthly] Starting calculation...');

        // Get all datasets
        const allDatasets = await db.Dataset.findAll({
            attributes: [
                'id', 'soc', 'soh', 'co2_saved', 'charging_frequency',
                'charging_time', 'total_distance', 'upload_date'
            ],
            where: {
                [Op.and]: [
                    { soc: { [Op.not]: null } },
                    { soh: { [Op.not]: null } }
                ]
            },
            order: [['upload_date', 'ASC']],
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
            const date = new Date(dataset.upload_date);
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
            const { calculateMetrics } = require("../services/analyticsService");
            const metrics = calculateMetrics(datasets, null, null, null);

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
                const previousMetrics = calculateMetrics(previousDatasets, null, null, null);

                // Calculate trend percentages
                trends.soc_trend = calculateTrend(metrics.average_soc, previousMetrics.average_soc);
                trends.soh_trend = calculateTrend(metrics.average_soh, previousMetrics.average_soh);
                trends.co2_trend = calculateTrend(metrics.total_co2_saved, previousMetrics.total_co2_saved);
                trends.charges_trend = calculateTrend(metrics.total_charges, previousMetrics.total_charges);
                trends.distance_trend = calculateTrend(metrics.total_distance, previousMetrics.total_distance);
            }

            // Create or update AnalyticsMonth record
            const [monthRecord] = await db.AnalyticsMonth.findOrCreate({
                where: { month_string: monthString },
                defaults: {
                    month: month,
                    year: year,
                    month_string: monthString
                }
            });

            // Create Analytics record with trends
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

            console.log(`[Analytics Monthly] ✅ Month ${monthString}: ${metrics.data_count} records, Trends: SoC${trends.soc_trend}%, Co2${trends.co2_trend}%`);
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

/**
 * Calculate trend percentage between two values
 */
function calculateTrend(currentValue, previousValue) {
    if (!previousValue || previousValue === 0) return 0;
    const trend = ((currentValue - previousValue) / previousValue) * 100;
    return parseFloat(trend.toFixed(2));
}

calculateMonthlyAnalytics()
  .then(result => {
    console.log('[Analytics Monthly] ✅ Success:', result);
    process.exit(0);
  })
  .catch(error => {
    console.error('[Analytics Monthly] ❌ Error:', error);
    process.exit(1);
  });
