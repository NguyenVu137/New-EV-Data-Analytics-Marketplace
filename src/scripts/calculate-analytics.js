const db = require("../models/index");
const { Op } = require('sequelize');

/**
 * Calculate analytics data from datasets table and store in analytics table
 * This script:
 * 1. Reads data from datasets table
 * 2. Calculates analytics metrics (averages, totals)
 * 3. Stores results in analytics table
 */
async function calculateAndImportAnalytics() {
    try {
        console.log('\n' + '='.repeat(70));
        console.log('📊 Starting Analytics Calculation and Import');
        console.log('='.repeat(70));

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

        console.log(`\n📈 Found ${allDatasets.length} valid dataset records`);

        if (allDatasets.length === 0) {
            console.warn('⚠️  No valid datasets found. Please import data first.');
            console.log('Run: npm run import:datasets');
            process.exit(0);
        }

        // Calculate overall analytics (all data, no filters)
        const overallAnalytics = calculateMetrics(allDatasets, null, null, null);
        
        console.log('\n📊 Calculated Metrics:');
        console.log(`  - Average SoC: ${overallAnalytics.average_soc.toFixed(2)}%`);
        console.log(`  - Average SoH: ${overallAnalytics.average_soh.toFixed(2)}%`);
        console.log(`  - Total CO2 Saved: ${overallAnalytics.total_co2_saved.toFixed(2)} kg`);
        console.log(`  - Total Charges: ${overallAnalytics.total_charges}`);
        console.log(`  - Average Charging Time: ${overallAnalytics.average_charging_time.toFixed(2)} min`);
        console.log(`  - Total Distance: ${overallAnalytics.total_distance.toFixed(2)} km`);
        console.log(`  - Data Count: ${overallAnalytics.data_count}`);

        // Clear existing analytics
        const deletedCount = await db.Analytics.destroy({ where: {} });
        console.log(`\n🗑️  Cleared ${deletedCount} existing analytics records`);

        // Insert new overall analytics
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

        console.log(`\n✅ Created analytics record (ID: ${analyticsRecord.id})`);

        // Optional: Calculate analytics by region
        const regions = [...new Set(allDatasets.map(d => d.region).filter(Boolean))];
        console.log(`\n📍 Found ${regions.length} regions: ${regions.join(', ')}`);

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

        console.log(`✅ Created ${regions.length} region-specific analytics records`);

        // Optional: Calculate analytics by vehicle type
        const vehicleTypes = [...new Set(allDatasets.map(d => d.vehicle_type).filter(Boolean))];
        console.log(`\n🚗 Found ${vehicleTypes.length} vehicle types: ${vehicleTypes.join(', ')}`);

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

        console.log(`✅ Created ${vehicleTypes.length} vehicle type-specific analytics records`);

        // Optional: Calculate analytics by battery type
        const batteryTypes = [...new Set(allDatasets.map(d => d.battery_type).filter(Boolean))];
        console.log(`\n🔋 Found ${batteryTypes.length} battery types: ${batteryTypes.join(', ')}`);

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

        console.log(`✅ Created ${batteryTypes.length} battery type-specific analytics records`);

        // Verify import
        const totalRecords = await db.Analytics.count();
        console.log(`\n${'='.repeat(70)}`);
        console.log(`✅ Analytics calculation and import completed!`);
        console.log(`📊 Total analytics records in database: ${totalRecords}`);
        console.log('='.repeat(70) + '\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error during analytics calculation:', error);
        console.error(error.stack);
        process.exit(1);
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

    // Count non-null values for each field for better average calculation
    let socCount = 0, sohCount = 0, co2Count = 0, chargesCount = 0, chargingTimeCount = 0, distanceCount = 0;

    const totals = filteredDatasets.reduce((acc, d) => {
        const soc = parseFloat(d.soc) || 0;
        const soh = parseFloat(d.soh) || 0;
        const co2 = parseFloat(d.co2_saved) || 0;
        const charges = parseInt(d.charging_frequency) || 0;
        const chargingTime = parseInt(d.charging_time) || 0;
        const distance = parseFloat(d.total_distance) || 0;

        if (d.soc !== null && d.soc !== undefined) socCount++;
        if (d.soh !== null && d.soh !== undefined) sohCount++;
        if (d.co2_saved !== null && d.co2_saved !== undefined) co2Count++;
        if (d.charging_frequency !== null && d.charging_frequency !== undefined) chargesCount++;
        if (d.charging_time !== null && d.charging_time !== undefined) chargingTimeCount++;
        if (d.total_distance !== null && d.total_distance !== undefined) distanceCount++;

        return {
            soc: acc.soc + soc,
            soh: acc.soh + soh,
            co2_saved: acc.co2_saved + co2,
            charges: acc.charges + charges,
            charging_time: acc.charging_time + chargingTime,
            distance: acc.distance + distance
        };
    }, { soc: 0, soh: 0, co2_saved: 0, charges: 0, charging_time: 0, distance: 0 });

    return {
        average_soc: socCount > 0 ? totals.soc / socCount : 0,
        average_soh: sohCount > 0 ? totals.soh / sohCount : 0,
        total_co2_saved: totals.co2_saved,
        total_charges: totals.charges,
        average_charging_time: chargingTimeCount > 0 ? totals.charging_time / chargingTimeCount : 0,
        total_distance: totals.distance,
        data_count: filteredDatasets.length
    };
}

// Run if executed directly
if (require.main === module) {
    calculateAndImportAnalytics();
}

module.exports = { calculateAndImportAnalytics, calculateMetrics };
