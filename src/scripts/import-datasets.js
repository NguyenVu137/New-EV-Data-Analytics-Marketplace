const fs = require('fs');
const csv = require('csv-parse/sync');
const db = require('../models');
const { Dataset } = db;

async function importDatasets() {
    try {
        console.log('Starting dataset import...');
        
        // ✅ STEP 1: Xóa tất cả dữ liệu cũ
        console.log('🗑️  Deleting old datasets...');
        const deletedCount = await Dataset.destroy({ where: {} });
        console.log(`✅ Deleted ${deletedCount} old records`);
        
        // ✅ STEP 2: Read CSV file
        const fileContent = fs.readFileSync('./ev_data_sample_100.csv', 'utf-8');
        
        // ✅ STEP 3: Parse CSV
        const records = csv.parse(fileContent, {
            columns: true,
            skip_empty_lines: true
        });
        
        console.log(`Found ${records.length} records to import`);
        
        // Transform data to match Dataset model
        const datasets = records.map(row => ({
            name: row.name,
            data_type: row.data_type,
            region: row.region,
            //upload_date: new Date(row.upload_date),
            basic_price: parseFloat(row.basic_price),
            standard_price: parseFloat(row.standard_price),
            premium_price: parseFloat(row.premium_price),
            provider: row.provider,
            soc: parseFloat(row.soc),
            soh: parseFloat(row.soh),
            co2_saved: parseFloat(row.co2_saved),
            charging_frequency: parseInt(row.charging_frequency),
            charging_time: parseInt(row.charging_time),
            total_distance: parseFloat(row.total_distance),
            vehicle_type: row.vehicle_type,
            battery_type: row.battery_type,
            format: row.format,
            description: row.description,
            createdAt: new Date(row.upload_date),
            updatedAt: new Date()
        }));
        
        // Bulk insert
        const result = await Dataset.bulkCreate(datasets, {
            validate: true,
            individualHooks: false
        });
        
        console.log(`✅ Successfully imported ${result.length} datasets`);
        console.log('Import completed!');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error importing datasets:', error);
        console.error(error.stack);
        process.exit(1);
    }
}

// Connect to database and run import
db.sequelize.authenticate()
    .then(() => {
        console.log('Database connection established');
        return importDatasets();
    })
    .catch(error => {
        console.error('Database connection failed:', error);
        process.exit(1);
    });
