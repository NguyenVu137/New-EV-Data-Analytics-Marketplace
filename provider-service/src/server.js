import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import providerRoutes from './routes/providerRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8085;

app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
    res.json({ service: 'provider-service', status: 'healthy' });
});

app.use('/api/providers', providerRoutes);

app.listen(PORT, () => {
    console.log(`👤 Provider Service running on port ${PORT}`);
});

export default app;
