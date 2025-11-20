import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import connectDB from "./config/connectDB";
import analyticsRoutes from "./routes/analyticsRoutes";
import triggerAnalyticsRecalculation from "./middleware/analyticsMiddleware";
import { calculateMonthlyAnalytics } from "./services/analyticsService";
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[ANALYTICS-SERVICE] [${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Middleware to trigger analytics recalculation on dataset changes
app.use(triggerAnalyticsRecalculation);

// Routes
app.use('/api', analyticsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Analytics Service is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('[ANALYTICS-SERVICE] Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Connect to database
connectDB();

const PORT = process.env.PORT || 7004;

// Initialize analytics when server starts
const db = require('./models');

async function initializeAnalytics() {
  try {
    // Wait for DB connection
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const analyticsCount = await db.Analytics.count().catch(() => 0);
    console.log(`[ANALYTICS-SERVICE] Analytics records found: ${analyticsCount}`);
    
    if (analyticsCount === 0) {
      console.log('[ANALYTICS-SERVICE] Analytics table is empty, triggering initial calculation...');
      try {
        await calculateMonthlyAnalytics();
        console.log('[ANALYTICS-SERVICE] Initial analytics calculation completed');
      } catch (error) {
        console.error('[ANALYTICS-SERVICE] Error during initial calculation:', error.message);
      }
    }
  } catch (error) {
    console.error('[ANALYTICS-SERVICE] Error during initialization:', error.message);
  }
}

app.listen(PORT, () => {
  console.log(`✅ Analytics Service is running on port ${PORT}`);
  initializeAnalytics();
});

export default app;
