import express from 'express';
import * as transactionController from '../controllers/transactionController';
import { auth } from '../middlewares/auth';
import { checkRole } from '../middlewares/checkRole';

const router = express.Router();

// Provider revenue
router.get('/revenue', auth, checkRole(['R2', 'R1']), transactionController.getProviderRevenue);

// Consumer transaction
router.post('/', auth, checkRole(['R3', 'R2', 'R1']), transactionController.createTransaction);

export default router;
