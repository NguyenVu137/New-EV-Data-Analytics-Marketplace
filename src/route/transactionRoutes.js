import express from 'express';
import * as transactionController from '../controllers/transactionController';
import { auth } from '../middlewares/auth';
import { checkRole } from '../middlewares/checkRole';

const router = express.Router();


// Purchase dataset
router.post('/purchase', auth, checkRole(['R3', 'R2', 'R1']), transactionController.purchaseDataset
);

// Check download permission
router.get('/check-permission/:datasetId', auth, checkRole(['R3', 'R2', 'R1']), transactionController.checkDownloadPermission
);

// Get user purchases
router.get('/my-purchases', auth, checkRole(['R3', 'R2', 'R1']), transactionController.getUserPurchases
);


// Provider revenue
router.get('/revenue', auth, checkRole(['R2', 'R1']), transactionController.getProviderRevenue);

router.post('/', auth, checkRole(['R3', 'R2', 'R1']), transactionController.createTransaction);

export default router;