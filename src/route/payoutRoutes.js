//  FILE 2: routes/payoutRoutes.js 
// Xử lý RÚT TIỀN cho PROVIDER
import express from 'express';
import * as payoutController from '../controllers/payoutController';
import { auth } from '../middlewares/auth';
import { checkRole } from '../middlewares/checkRole';

const router = express.Router();

// ===== PROVIDER ROUTES =====
// Lấy danh sách payout của mình
router.get('/my-payouts',
    auth,
    checkRole(['R2']),
    payoutController.getMyPayouts
);

// Xem số dư
router.get('/balance',
    auth,
    checkRole(['R2']),
    payoutController.getBalance
);

// Yêu cầu rút tiền
router.post('/withdraw',
    auth,
    checkRole(['R2']),
    payoutController.requestWithdraw
);

// ===== ADMIN ROUTES =====
// Lấy danh sách yêu cầu rút chờ duyệt
router.get('/admin/pending',
    auth,
    checkRole(['R1']),
    payoutController.getPendingPayouts
);

// Duyệt/từ chối rút tiền
router.post('/admin/process/:payoutId',
    auth,
    checkRole(['R1']),
    payoutController.processPayout
);

// Lấy tất cả payout (có filter status)
router.get('/admin/all',
    auth,
    checkRole(['R1']),
    payoutController.getAllPayouts
);

// Thống kê payout
router.get('/admin/statistics',
    auth,
    checkRole(['R1']),
    payoutController.getPayoutStatistics
);

export default router;