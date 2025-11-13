const db = require("../models/index");
const { Op } = require('sequelize');

/**
 * Calculate metrics from datasets and update analytics table
 */
async function calculateAnalyticsMetrics() {
    try {
        console.log('[Analytics] Calculating metrics from datasets...');

        // Get all datasets
        const allDatasets = await db.Dataset.findAll({
            attributes: [
                'id', 'soc', 'soh', 'co2_saved', 'charging_frequency', 
                'charging_time', 'total_distance', 'region', 'vehicle_type', 
                'battery_type', 'upload_date'
            ],
            where: {
                [Op.and]: [
                    { soc: { [Op.not]: null } },
                    { soh: { [Op.not]: null } }
                ]
            },
            order: [['upload_date', 'DESC']],
            raw: true
        });

        if (allDatasets.length === 0) {
            console.log('[Analytics] No datasets found');
            return { success: true, message: 'No datasets to calculate' };
        }

        console.log(`[Analytics] Found ${allDatasets.length} dataset records`);

        // Calculate overall metrics
        const overallAnalytics = calculateMetrics(allDatasets, null, null, null);
        
        // Clear existing analytics
        await db.Analytics.destroy({ where: {} });

        // Insert overall analytics
        const analyticsRecord = await db.Analytics.create({
            timestamp: new Date(),
            average_soc: overallAnalytics.average_soc,
            average_soh: overallAnalytics.average_soh,
            total_co2_saved: overallAnalytics.total_co2_saved,
            total_charges: overallAnalytics.total_charges,
            average_charging_time: overallAnalytics.average_charging_time,
            total_distance: overallAnalytics.total_distance,
            data_count: overallAnalytics.data_count,
            region: null,
            vehicle_type: null,
            battery_type: null,
            period: 'all'
        });

        console.log('[Analytics] Created overall analytics record');

        // Calculate by region
        const regions = [...new Set(allDatasets.map(d => d.region).filter(Boolean))];
        for (const region of regions) {
            const regionDatasets = allDatasets.filter(d => d.region === region);
            const regionAnalytics = calculateMetrics(regionDatasets, region, null, null);
            
            await db.Analytics.create({
                timestamp: new Date(),
                average_soc: regionAnalytics.average_soc,
                average_soh: regionAnalytics.average_soh,
                total_co2_saved: regionAnalytics.total_co2_saved,
                total_charges: regionAnalytics.total_charges,
                average_charging_time: regionAnalytics.average_charging_time,
                total_distance: regionAnalytics.total_distance,
                data_count: regionAnalytics.data_count,
                region: region,
                vehicle_type: null,
                battery_type: null,
                period: 'all'
            });
        }

        // Calculate by vehicle type
        const vehicleTypes = [...new Set(allDatasets.map(d => d.vehicle_type).filter(Boolean))];
        for (const vehicleType of vehicleTypes) {
            const vehicleDatasets = allDatasets.filter(d => d.vehicle_type === vehicleType);
            const vehicleAnalytics = calculateMetrics(vehicleDatasets, null, vehicleType, null);
            
            await db.Analytics.create({
                timestamp: new Date(),
                average_soc: vehicleAnalytics.average_soc,
                average_soh: vehicleAnalytics.average_soh,
                total_co2_saved: vehicleAnalytics.total_co2_saved,
                total_charges: vehicleAnalytics.total_charges,
                average_charging_time: vehicleAnalytics.average_charging_time,
                total_distance: vehicleAnalytics.total_distance,
                data_count: vehicleAnalytics.data_count,
                region: null,
                vehicle_type: vehicleType,
                battery_type: null,
                period: 'all'
            });
        }

        // Calculate by battery type
        const batteryTypes = [...new Set(allDatasets.map(d => d.battery_type).filter(Boolean))];
        for (const batteryType of batteryTypes) {
            const batteryDatasets = allDatasets.filter(d => d.battery_type === batteryType);
            const batteryAnalytics = calculateMetrics(batteryDatasets, null, null, batteryType);
            
            await db.Analytics.create({
                timestamp: new Date(),
                average_soc: batteryAnalytics.average_soc,
                average_soh: batteryAnalytics.average_soh,
                total_co2_saved: batteryAnalytics.total_co2_saved,
                total_charges: batteryAnalytics.total_charges,
                average_charging_time: batteryAnalytics.average_charging_time,
                total_distance: batteryAnalytics.total_distance,
                data_count: batteryAnalytics.data_count,
                region: null,
                vehicle_type: null,
                battery_type: batteryType,
                period: 'all'
            });
        }

        const totalRecords = await db.Analytics.count();
        console.log(`[Analytics] ✅ Calculation completed! Total records: ${totalRecords}`);

        return { 
            success: true, 
            message: 'Analytics calculated successfully',
            totalRecords: totalRecords
        };

    } catch (error) {
        console.error('[Analytics] Error calculating metrics:', error);
        throw error;
    }
}

/**
 * Calculate metrics from datasets
 */
function calculateMetrics(datasets, region = null, vehicleType = null, batteryType = null) {
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

    const filteredDatasets = datasets.filter(d => {
        if (region && d.region !== region) return false;
        if (vehicleType && d.vehicle_type !== vehicleType) return false;
        if (batteryType && d.battery_type !== batteryType) return false;
        return true;
    });

    if (filteredDatasets.length === 0) {
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

    const totals = filteredDatasets.reduce((acc, d) => {
        return {
            soc: acc.soc + (parseFloat(d.soc) || 0),
            soh: acc.soh + (parseFloat(d.soh) || 0),
            co2_saved: acc.co2_saved + (parseFloat(d.co2_saved) || 0),
            charges: acc.charges + (parseInt(d.charging_frequency) || 0),
            charging_time: acc.charging_time + (parseInt(d.charging_time) || 0),
            distance: acc.distance + (parseFloat(d.total_distance) || 0)
        };
    }, { soc: 0, soh: 0, co2_saved: 0, charges: 0, charging_time: 0, distance: 0 });

    return {
        average_soc: totals.soc / filteredDatasets.length,
        average_soh: totals.soh / filteredDatasets.length,
        total_co2_saved: totals.co2_saved,
        total_charges: totals.charges,
        average_charging_time: filteredDatasets.length > 0 ? totals.charging_time / filteredDatasets.length : 0,
        total_distance: totals.distance,
        data_count: filteredDatasets.length
    };
}

/**
 * Get available months for filter dropdown - Lấy từ bảng analytics_months
 */
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

/**
 * Group datasets by day within a month
 */
function groupDatasetsByDay(datasets) {
    const groupedByDay = {};
    
    datasets.forEach(dataset => {
        const dateStr = new Date(dataset.upload_date).toISOString().split('T')[0];
        if (!groupedByDay[dateStr]) {
            groupedByDay[dateStr] = [];
        }
        groupedByDay[dateStr].push(dataset);
    });

    const timestamps = Object.keys(groupedByDay).sort();
    
    // Calculate daily averages for SoC and SoH
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

/**
 * Calculate trend percentage between two values
 */
function calculateTrendPercentage(previousValue, currentValue) {
    if (!previousValue || previousValue === 0) return 0;
    return ((currentValue - previousValue) / previousValue) * 100;
}

/**
 * Determine trend arrow based on percentage
 */
function calculateTrendArrow(trendPercentage) {
    if (trendPercentage > 0) return '↑';
    if (trendPercentage < 0) return '↓';
    return '→';
}

module.exports = { 
    calculateAnalyticsMetrics, 
    calculateMetrics, 
    groupDatasetsByDay, 
    getAvailableMonths,
    calculateTrendPercentage,
    calculateTrendArrow
};
