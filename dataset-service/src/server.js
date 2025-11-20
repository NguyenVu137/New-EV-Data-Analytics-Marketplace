import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import connectDB from "./config/connectDB";
import datasetRoutes from "./routes/datasetRoutes";
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[DATASET-SERVICE] [${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api', datasetRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Dataset Service is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('[DATASET-SERVICE] Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Connect to database
connectDB();

const PORT = process.env.PORT || 7002;

// Initialize datasets when server starts
const db = require('./models');
const fs = require('fs');
const { parse } = require('csv-parse/sync');

async function initializeDatasets() {
  try {
    // Wait for DB connection
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const datasetCount = await db.Dataset.count().catch(() => 0);
    console.log(`[DATASET-SERVICE] Datasets found: ${datasetCount}`);
    
    if (datasetCount === 0) {
      console.log('[DATASET-SERVICE] Dataset table is empty, importing from CSV...');
      try {
        const fileContent = fs.readFileSync(__dirname + '/../../ev_data_sample_100.csv', 'utf-8');
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true
        });
        
        const datasets = records.map(row => ({
            name: row.name,
            data_type: row.data_type,
            region: row.region,
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
            createdAt: new Date(),
            updatedAt: new Date()
        }));
        
        const result = await db.Dataset.bulkCreate(datasets, {
            validate: true,
            individualHooks: false
        });
        
        console.log(`[DATASET-SERVICE] Successfully imported ${result.length} datasets`);
      } catch (error) {
        console.error('[DATASET-SERVICE] Error during import:', error.message);
      }
    }
  } catch (error) {
    console.error('[DATASET-SERVICE] Error during initialization:', error.message);
  }
}

app.listen(PORT, () => {
  console.log(`✅ Dataset Service is running on port ${PORT}`);
  initializeDatasets();
});

export default app;
