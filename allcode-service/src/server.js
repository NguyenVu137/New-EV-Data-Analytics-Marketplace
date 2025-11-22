import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import allcodeRoutes from './routes/allcodeRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8087;

// Middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get('/api/allcode', allcodeRoutes.getAllCode);
app.get('/api/allcode/types', allcodeRoutes.getAllTypes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'allcode-service' });
});

app.listen(PORT, () => {
    console.log(`🚀 Allcode Service running on port ${PORT}`);
});
