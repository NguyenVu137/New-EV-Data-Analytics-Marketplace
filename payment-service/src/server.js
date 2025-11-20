import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import connectDB from "./config/connectDB";
import paymentRoutes from "./routes/paymentRoutes";
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[PAYMENT-SERVICE] [${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api', paymentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Payment Service is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('[PAYMENT-SERVICE] Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Connect to database
connectDB();

const PORT = process.env.PORT || 7003;
app.listen(PORT, () => {
  console.log(`✅ Payment Service is running on port ${PORT}`);
});

export default app;
