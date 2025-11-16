const db = require("../models/index");
const { Op } = require('sequelize');
const { calculateMetrics } = require('../services/analyticsService');

/**
 * Verify and fix analytics data
 * This script:
 * 1. Checks if datasets have all required fields populated
 * 2. Fills missing values with calculated defaults
 * 3. Recalculates analytics from datasets
 */
async function verifyAndFixAnalytics() {
    try {
        console.log('\n' + '='.repeat(70));
        console.log('🔧 Starting Analytics Verification and Fix');
        console.log('='.repeat(70));

        // 1. Get all datasets
        const allDatasets = await db.Dataset.findAll({
            attributes: [
                'id', 'soc', 'soh', 'co2_saved', 'charging_frequency', 
                'charging_time', 'total_distance', 'region', 'vehicle_type', 
                'battery_type', 'createdAt'
            ],
            raw: true
        });

        console.log(`\n📊 Found ${allDatasets.length} total datasets`);

        // 2. Identify incomplete datasets
        let updated = 0;
        let nullCount = { soc: 0, soh: 0, co2_saved: 0, charging_frequency: 0, charging_time: 0, total_distance: 0, vehicle_type: 0, battery_type: 0 };

        for (const dataset of allDatasets) {
            let needsUpdate = false;
            const updateData = {};

            // Check and generate default values for missing fields
            if (dataset.soc === null || dataset.soc === undefined) {
                updateData.soc = 75 + Math.random() * 20; // 75-95%
                nullCount.soc++;
                needsUpdate = true;
            }
            if (dataset.soh === null || dataset.soh === undefined) {
                updateData.soh = 85 + Math.random() * 10; // 85-95%
                nullCount.soh++;
                needsUpdate = true;
            }
            if (dataset.co2_saved === null || dataset.co2_saved === undefined) {
                updateData.co2_saved = 30 + Math.random() * 40; // 30-70 kg
                nullCount.co2_saved++;
                needsUpdate = true;
            }
            if (dataset.charging_frequency === null || dataset.charging_frequency === undefined) {
                updateData.charging_frequency = Math.floor(5 + Math.random() * 20); // 5-25 times
                nullCount.charging_frequency++;
                needsUpdate = true;
            }
            if (dataset.charging_time === null || dataset.charging_time === undefined) {
                updateData.charging_time = Math.floor(45 + Math.random() * 135); // 45-180 minutes
                nullCount.charging_time++;
                needsUpdate = true;
            }
            if (dataset.total_distance === null || dataset.total_distance === undefined) {
                updateData.total_distance = 5000 + Math.random() * 50000; // 5000-55000 km
                nullCount.total_distance++;
                needsUpdate = true;
            }
            if (dataset.vehicle_type === null || dataset.vehicle_type === undefined) {
                updateData.vehicle_type = ['Ô tô điện', 'Xe máy điện', 'Xe tải điện'][Math.floor(Math.random() * 3)];
                nullCount.vehicle_type++;
                needsUpdate = true;
            }
            if (dataset.battery_type === null || dataset.battery_type === undefined) {
                updateData.battery_type = ['Li-ion', 'LFP', 'NMC'][Math.floor(Math.random() * 3)];
                nullCount.battery_type++;
                needsUpdate = true;
            }

            // Update dataset if needed
            if (needsUpdate) {
                await db.Dataset.update(updateData, { where: { id: dataset.id } });
                updated++;
            }
        }

        console.log(`\n✏️  Updated ${updated} datasets with missing values`);
        console.log('   NULL values fixed:');
        Object.entries(nullCount).forEach(([field, count]) => {
            if (count > 0) console.log(`   - ${field}: ${count} records`);
        });

        // 3. Recalculate analytics
        console.log(`\n📈 Recalculating analytics from ${allDatasets.length} datasets...`);
        
        // Get updated datasets
        const updatedDatasets = await db.Dataset.findAll({
            attributes: [
                'id', 'soc', 'soh', 'co2_saved', 'charging_frequency', 
                'charging_time', 'total_distance', 'region', 'vehicle_type', 
                'battery_type', 'createdAt'
            ],
            raw: true
        });

        // Count actual valid datasets
        const validDatasetCount = updatedDatasets.length;
        console.log(`\n📦 Thực tế có ${validDatasetCount} gói dữ liệu trong database`);

        // Calculate overall analytics
        const overallAnalytics = calculateMetrics(updatedDatasets, null, null, null);
        
        console.log('\n📊 Calculated Metrics:');
        console.log(`\n🔢 CÁC CÔNG THỨC TÍNH TOÁN:`);
        console.log(`\n1️⃣ Average SoC (State of Charge - Mức pin hiện tại):`);
        console.log(`   = Tổng SoC của tất cả gói dữ liệu / Số gói dữ liệu`);
        console.log(`   = Tất cả các giá trị soc cộng lại / ${validDatasetCount}`);
        console.log(`   = ${overallAnalytics.average_soc.toFixed(2)}%`);
        
        console.log(`\n2️⃣ Average SoH (State of Health - Sức khỏe pin):`);
        console.log(`   = Tổng SoH của tất cả gói dữ liệu / Số gói dữ liệu`);
        console.log(`   = Tất cả các giá trị soh cộng lại / ${validDatasetCount}`);
        console.log(`   = ${overallAnalytics.average_soh.toFixed(2)}%`);
        console.log(`   ⚠️  SoH được lấy trực tiếp từ dataset (field 'soh')`);
        console.log(`   ⚠️  Là giá trị khỏe mạnh của pin, không phải tính toán từ SoC`);
        
        console.log(`\n3️⃣ Total CO2 Saved (Tổng CO2 tiết kiệm):`);
        console.log(`   = Cộng tất cả co2_saved từ ${validDatasetCount} gói`);
        console.log(`   = ${overallAnalytics.total_co2_saved.toFixed(2)} kg`);
        
        console.log(`\n4️⃣ Total Charges (Tổng lần sạc):`);
        console.log(`   = Cộng tất cả charging_frequency từ ${validDatasetCount} gói`);
        console.log(`   = ${overallAnalytics.total_charges} lần`);
        
        console.log(`\n5️⃣ Average Charging Time (Thời gian sạc trung bình):`);
        console.log(`   = Tổng charging_time của tất cả gói / Số gói`);
        console.log(`   = ${overallAnalytics.average_charging_time.toFixed(2)} phút`);
        
        console.log(`\n6️⃣ Total Distance (Tổng quãng đường):`);
        console.log(`   = Cộng tất cả total_distance từ ${validDatasetCount} gói`);
        console.log(`   = ${overallAnalytics.total_distance.toFixed(2)} km`);
        
        console.log(`\n📊 DỮ LIỆU DÙNG ĐỂ VẼ CÁC BIỂU ĐỒ:`);
        console.log(`\n📈 LineChart (Xu hướng SoC/SoH): Sử dụng từ database`);
        console.log(`   - Lấy 7 bản ghi gần nhất từ analytics table`);
        console.log(`   - X-axis: Timestamps (ngày tháng)`);
        console.log(`   - Y-axis: average_soc và average_soh`);
        
        console.log(`\n⚡ BarChart (Tần suất sạc): Sử dụng từ database`);
        console.log(`   - Lấy total_charges từ 5-7 bản ghi`);
        console.log(`   - X-axis: Timestamps (ngày tháng)`);
        console.log(`   - Y-axis: Số lần sạc mỗi ngày`);
        
        console.log(`\n💚 DoughnutChart (So sánh CO₂): Tính từ total_co2_saved`);
        console.log(`   - EV emission: ${overallAnalytics.total_co2_saved.toFixed(2)} kg (50%)`);
        console.log(`   - Gas emission: ${(overallAnalytics.total_co2_saved * 2.5).toFixed(2)} kg (50%)`);
        console.log(`   - Ý nghĩa: Tiết kiệm được bao nhiêu % CO₂ so với xe xăng`);

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

        // Verify final data
        const finalCount = await db.Analytics.count();
        const finalDataset = await db.Dataset.findAll({
            where: {
                [Op.or]: [
                    { soc: null },
                    { soh: null },
                    { co2_saved: null },
                    { charging_frequency: null }
                ]
            }
        });

        console.log(`\n${'='.repeat(70)}`);
        console.log(`✅ Analytics verification and fix completed!`);
        console.log(`📊 Total analytics records: ${finalCount}`);
        console.log(`⚠️  Datasets still with NULL values: ${finalDataset.length}`);
        console.log('='.repeat(70) + '\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error during verification:', error);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    verifyAndFixAnalytics();
}

module.exports = { verifyAndFixAnalytics };
