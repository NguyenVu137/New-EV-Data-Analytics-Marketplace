const db = require('../models');
const paymentService = require('../services/paymentService');

/**
 * Payment Controller - Xử lý API payment
 */
const paymentController = {
  /**
   * POST /api/orders - Tạo đơn hàng
   */
  async createOrder(req, res) {
    try {
      const userId = req.user?.id; // From auth middleware
      const { datasetId, packageType } = req.body; 

      console.log(`[createOrder] userId: ${userId}, datasetId: ${datasetId}, packageType: ${packageType}`);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Vui lòng đăng nhập'
        });
      }

      if (!datasetId || !packageType) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: datasetId, packageType'
        });
      }

      if (!['basic', 'standard', 'premium'].includes(packageType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid packageType'
        });
      }

      const order = await paymentService.createOrder(userId, datasetId, packageType);

      console.log(`[createOrder] Order created successfully:`, order);

      res.json({
        success: true,
        order: {
          id: order.id,
          datasetId: order.datasetId,
          packageType: order.packageType,
          amount: order.amount,
          status: order.status,
          createdAt: order.createdAt
        }
      });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi tạo đơn hàng'
      });
    }
  },

  /**
   * POST /api/payments/:orderId - Khởi tạo thanh toán
   */
  async initiatePayment(req, res) {
    try {
      const { orderId } = req.params;
      const { paymentMethod } = req.body;

      console.log('[initiatePayment] Received:', { orderId, paymentMethod, body: req.body });

      if (!paymentMethod || !['creditcard', 'bank', 'momo', 'zalopay'].includes(paymentMethod)) {
        console.log('[initiatePayment] Invalid method:', { paymentMethod, isValid: ['creditcard', 'bank', 'momo', 'zalopay'].includes(paymentMethod) });
        return res.status(400).json({
          success: false,
          message: 'Invalid payment method'
        });
      }

      const payment = await paymentService.initiatePayment(orderId, paymentMethod);

      res.json({
        success: true,
        payment: payment
      });
    } catch (error) {
      console.error('Error initiating payment:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khởi tạo thanh toán'
      });
    }
  },

  /**
   * GET /api/payments/:paymentId/status - Check trạng thái thanh toán
   */
  async checkPaymentStatus(req, res) {
    try {
      const { paymentId } = req.params;

      console.log(`[checkPaymentStatus] Checking status for paymentId: ${paymentId}`);

      const payment = await paymentService.checkPaymentStatus(paymentId);

      console.log(`[checkPaymentStatus] Found payment:`, payment);

      res.json({
        success: true,
        data: payment
      });
    } catch (error) {
      console.error('Error checking payment status:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi kiểm tra trạng thái'
      });
    }
  },

  /**
   * POST /api/payments/creditcard - Thanh toán bằng thẻ tín dụng (Mock)
   */
  async processCreditCard(req, res) {
    try {
      const { transactionId, cardNumber, expiryDate, cvv, cardHolder } = req.body;

      console.log(`[processCreditCard] Processing payment for transactionId: ${transactionId}`);

      if (!transactionId || !cardNumber) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      // Validate card format
      if (!/^\d{13,19}$/.test(cardNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid card number'
        });
      }

      const result = await paymentService.processMockCreditCard(transactionId, cardNumber);

      console.log(`[processCreditCard] Payment result:`, result);

      res.json({
        success: result.status === 'success',
        message: result.message,
        data: {
          transactionId,
          status: result.status
        }
      });
    } catch (error) {
      console.error('Error processing credit card:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi xử lý thẻ tín dụng'
      });
    }
  },

  /**
   * POST /api/payments/webhook - Webhook từ payment gateway
   */
  async handleWebhook(req, res) {
    try {
      const { transactionId, status, amount } = req.body;

      if (!transactionId || !status) {
        return res.status(400).json({
          success: false,
          message: 'Invalid webhook data'
        });
      }

      if (status === 'success') {
        await paymentService.confirmPayment(transactionId, {
          amount,
          timestamp: new Date(),
          webhook: true
        });
      } else {
        await paymentService.failPayment(transactionId, req.body.reason || 'Webhook failed');
      }

      // Return 200 to acknowledge receipt
      res.json({ success: true, message: 'Webhook processed' });
    } catch (error) {
      console.error('Error handling webhook:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * GET /api/orders - Lấy lịch sử đơn hàng của user
   */
  async getUserOrders(req, res) {
    try {
      const userId = req.user?.id;
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 12, 100);
      const offset = (page - 1) * limit;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Vui lòng đăng nhập'
        });
      }

      const { orders, total } = await paymentService.getUserOrders(userId, limit, offset);

      res.json({
        success: true,
        data: {
          orders,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error getting user orders:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi lấy danh sách đơn hàng'
      });
    }
  },

  /**
   * GET /api/subscriptions - Lấy gói subscription của user
   */
  async getUserSubscriptions(req, res) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Vui lòng đăng nhập'
        });
      }

      const subscriptions = await paymentService.getUserSubscriptions(userId);

      res.json({
        success: true,
        data: subscriptions
      });
    } catch (error) {
      console.error('Error getting user subscriptions:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi lấy danh sách subscription'
      });
    }
  },

  /**
   * DELETE /api/subscriptions/:subscriptionId - Hủy subscription
   */
  async cancelSubscription(req, res) {
    try {
      const userId = req.user?.id;
      const { subscriptionId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Vui lòng đăng nhập'
        });
      }

      await paymentService.cancelSubscription(subscriptionId, userId);

      res.json({
        success: true,
        message: 'Subscription hủy thành công'
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi hủy subscription'
      });
    }
  }
};

module.exports = paymentController;
