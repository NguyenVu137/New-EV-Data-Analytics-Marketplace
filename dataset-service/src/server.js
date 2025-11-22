import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import datasetRoutes from './routes/datasetRoutes';
import { connectDB } from './config/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8082;

app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/health', (req, res) => {
    res.json({ service: 'dataset-service', status: 'healthy' });
});

app.use('/api/datasets', datasetRoutes);

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`📁 Dataset Service running on port ${PORT}`);
    });
});

export default app;
