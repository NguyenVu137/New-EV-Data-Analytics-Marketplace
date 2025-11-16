//  FILE 1: routes/transactionRoutes.js 
// Xử lý MUA HÀNG & QUYỀN DOWNLOAD
import express from 'express';
import * as transactionController from '../controllers/transactionController';
import { auth } from '../middlewares/auth';
import { checkRole } from '../middlewares/checkRole';

const router = express.Router();

// Tạo transaction (mua dataset)
router.post('/create',
    auth,
    checkRole(['R3', 'R2', 'R1']),
    transactionController.createTransaction
);

// Payment callback từ gateway (không cần auth vì từ bên thứ 3)
router.post('/callback',
    transactionController.paymentCallback
);

// Simulate payment (dev mode - consumer có thể dùng)
router.post('/simulate/:transactionId',
    auth,
    transactionController.simulatePayment
);

// Kiểm tra quyền download
router.get('/check-permission/:datasetId',
    auth,
    checkRole(['R3', 'R2', 'R1']),
    transactionController.checkDownloadPermission
);

// Lấy danh sách đã mua
router.get('/purchases',
    auth,
    checkRole(['R3', 'R2', 'R1']),
    transactionController.getUserPurchases
);

// Lấy lịch sử giao dịch
router.get('/history',
    auth,
    checkRole(['R3', 'R2', 'R1']),
    transactionController.getUserTransactions
);

export default router;