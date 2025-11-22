const express = require('express');
const adminController = require('../controllers/adminController.js');

const router = express.Router();

// Import shared middleware (using require for CommonJS compatibility)
const { auth } = require('../../shared/middleware/auth.js');
const { checkRole } = require('../../shared/middleware/checkRole.js');

// User Management (delegates to Auth Service)
router.get('/users', auth, checkRole(['R1']), adminController.getAllUsers);
router.post('/users', auth, checkRole(['R1']), adminController.createUser);
router.put('/users', auth, checkRole(['R1']), adminController.updateUser);
router.delete('/users', auth, checkRole(['R1']), adminController.deleteUser);

// Dataset Approval (delegates to Dataset Service)
router.get('/datasets/pending', auth, checkRole(['R1']), adminController.getPendingDatasets);
router.put('/datasets/:id/approve', auth, checkRole(['R1']), adminController.approveDataset);
router.put('/datasets/:id/reject', auth, checkRole(['R1']), adminController.rejectDataset);

// Payout Management (delegates to Transaction Service)
router.get('/payouts/pending', auth, checkRole(['R1']), adminController.getPendingPayouts);
router.post('/payouts/:id/process', auth, checkRole(['R1']), adminController.processPayoutRequest);
router.get('/payouts/statistics', auth, checkRole(['R1']), adminController.getPayoutStatistics);
router.get('/payouts', auth, checkRole(['R1']), adminController.getAllPayouts);

// Analytics Dashboard (delegates to Analytics Service)
router.get('/analytics/overview', auth, checkRole(['R1']), adminController.getAnalyticsOverview);
router.get('/analytics/ai-insights', auth, checkRole(['R1']), adminController.getAIInsights);
module.exports = router;
