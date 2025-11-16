const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authMiddleware } = require('../middleware/auth'); // 

// Process credit card payment (mock) - MUST come before /payments/:orderId
router.post('/payments/creditcard', paymentController.processCreditCard);

// Create order
router.post('/orders', authMiddleware, paymentController.createOrder);

// Initiate payment
router.post('/payments/:orderId', authMiddleware, paymentController.initiatePayment);

// Check payment status
router.get('/payments/:paymentId/status', paymentController.checkPaymentStatus);

// Webhook from payment gateway
router.post('/payments/webhook', paymentController.handleWebhook);

// Get user orders
router.get('/orders', authMiddleware, paymentController.getUserOrders);

// Get user subscriptions
router.get('/subscriptions', authMiddleware, paymentController.getUserSubscriptions);

// Cancel subscription
router.delete('/subscriptions/:subscriptionId', authMiddleware, paymentController.cancelSubscription);

module.exports = router;
