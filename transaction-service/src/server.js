import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import transactionRoutes from './routes/transactionRoutes';
import { connectDB } from './config/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8083;

app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
    res.json({ service: 'transaction-service', status: 'healthy' });
});

app.use('/api/transactions', transactionRoutes);

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`💳 Transaction Service running on port ${PORT}`);
    });
});

export default app;
