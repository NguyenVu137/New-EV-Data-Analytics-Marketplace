const db = require('../models');
const { Op } = require('sequelize');

/**
 * Payment Service - Xử lý logic thanh toán
 */
class PaymentService {
  /**
   * Tạo đơn hàng mới
   */
  async createOrder(userId, datasetId, packageType) {
    try {
      // Validate dataset tồn tại
      const dataset = await db.Dataset.findByPk(datasetId);
      if (!dataset) {
        throw new Error('Dataset không tồn tại');
      }

      // Lấy giá dựa vào packageType
      const priceMap = {
        basic: dataset.basic_price,
        standard: dataset.standard_price,
        premium: dataset.premium_price
      };

      const amount = priceMap[packageType];
      if (!amount) {
        throw new Error('Gói dữ liệu không hợp lệ');
      }

      // Tạo order
      const order = await db.Order.create({
        userId,
        datasetId,
        packageType,
        amount,
        status: 'pending'
      });

      console.log(`[PaymentService] Order created: ${order.id} for user ${userId}`);
      return order;
    } catch (error) {
      console.error('[PaymentService] Error creating order:', error.message);
      throw error;
    }
  }

  /**
   * Khởi tạo thanh toán
   */
  async initiatePayment(orderId, paymentMethod) {
    try {
      // Validate order tồn tại
      const order = await db.Order.findByPk(orderId, {
        include: [{ model: db.Dataset, as: 'dataset' }]
      });

      if (!order) {
        throw new Error('Đơn hàng không tồn tại');
      }

      if (order.status !== 'pending') {
        throw new Error('Trạng thái đơn hàng không hợp lệ');
      }

      // Tạo transaction ID
      const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Tạo payment record
      const payment = await db.Payment.create({
        orderId,
        paymentMethod,
        transactionId,
        amount: order.amount,
        status: 'pending'
      });

      console.log(`[PaymentService] Payment initiated: ${payment.id} (${transactionId})`);
      return {
        id: payment.id,
        orderId,
        transactionId,
        amount: order.amount,
        status: 'pending'
      };
    } catch (error) {
      console.error('[PaymentService] Error initiating payment:', error.message);
      throw error;
    }
  }

  /**
   * Check trạng thái thanh toán
   */
  async checkPaymentStatus(paymentId) {
    try {
      const payment = await db.Payment.findByPk(paymentId, {
        include: [
          {
            model: db.Order,
            as: 'order',
            include: [{ model: db.Dataset, as: 'dataset' }]
          }
        ]
      });

      if (!payment) {
        throw new Error('Thanh toán không tồn tại');
      }

      console.log('[checkPaymentStatus] Payment found:', {
        id: payment.id,
        status: payment.status,
        hasOrder: !!payment.order,
        hasDataset: !!payment.order?.dataset
      });

      return {
        id: payment.id,
        orderId: payment.orderId,
        transactionId: payment.transactionId,
        status: payment.status,
        amount: payment.amount,
        order: {
          id: payment.order.id,
          datasetName: payment.order.dataset?.name || 'Dataset',
          packageType: payment.order.packageType
        }
      };
    } catch (error) {
      console.error('[PaymentService] Error checking payment status:', error.message);
      throw error;
    }
  }

  /**
   * Xác nhận thanh toán thành công (từ webhook hoặc mock)
   */
  async confirmPayment(transactionId, paymentDetails = {}) {
    try {
      const payment = await db.Payment.findOne({
        where: { transactionId }
      });

      if (!payment) {
        throw new Error('Thanh toán không tồn tại');
      }

      if (payment.status !== 'pending') {
        throw new Error('Thanh toán đã được xử lý');
      }

      // Update payment
      await payment.update({
        status: 'success',
        paymentGatewayResponse: paymentDetails
      });

      // Lấy order
      const order = await db.Order.findByPk(payment.orderId);
      await order.update({ status: 'confirmed' });

      // Tạo subscription nếu là gói standard hoặc premium
      if (['standard', 'premium'].includes(order.packageType)) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1); // +1 tháng

        await db.Subscription.create({
          userId: order.userId,
          datasetId: order.datasetId,
          packageType: order.packageType,
          orderId: order.id,
          startDate,
          endDate,
          status: 'active',
          autoRenew: true
        });

        console.log(`[PaymentService] Subscription created for user ${order.userId}`);
      }

      // Tạo transaction record
      await db.Transaction.create({
        userId: order.userId,
        orderId: order.id,
        paymentId: payment.id,
        type: 'purchase',
        amount: payment.amount,
        status: 'success',
        description: `Mua gói ${order.packageType} - Dataset ${order.datasetId}`
      });

      console.log(`[PaymentService] Payment confirmed: ${transactionId}`);
      return { success: true, payment };
    } catch (error) {
      console.error('[PaymentService] Error confirming payment:', error.message);
      throw error;
    }
  }

  /**
   * Hủy thanh toán
   */
  async failPayment(transactionId, reason = 'Unknown') {
    try {
      const payment = await db.Payment.findOne({
        where: { transactionId }
      });

      if (!payment) {
        throw new Error('Thanh toán không tồn tại');
      }

      await payment.update({
        status: 'failed',
        paymentGatewayResponse: { reason }
      });

      // Update order status
      const order = await db.Order.findByPk(payment.orderId);
      await order.update({ status: 'failed' });

      console.log(`[PaymentService] Payment failed: ${transactionId} - ${reason}`);
      return { success: true };
    } catch (error) {
      console.error('[PaymentService] Error failing payment:', error.message);
      throw error;
    }
  }

  /**
   * Lấy lịch sử đơn hàng của user
   */
  async getUserOrders(userId, limit = 20, offset = 0) {
    try {
      const { rows, count } = await db.Order.findAndCountAll({
        where: { userId },
        include: [
          {
            model: db.Dataset,
            as: 'dataset',
            attributes: ['id', 'name', 'data_type', 'region']
          },
          {
            model: db.Payment,
            as: 'payment',
            attributes: ['id', 'status', 'transactionId']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });

      return { orders: rows, total: count };
    } catch (error) {
      console.error('[PaymentService] Error getting user orders:', error.message);
      throw error;
    }
  }

  /**
   * Lấy gói subscription của user
   */
  async getUserSubscriptions(userId) {
    try {
      const subscriptions = await db.Subscription.findAll({
        where: { userId, status: 'active' },
        include: [
          {
            model: db.Dataset,
            as: 'dataset',
            attributes: ['id', 'name', 'data_type', 'region']
          }
        ],
        order: [['endDate', 'ASC']]
      });

      // Check expired subscriptions
      const now = new Date();
      for (const sub of subscriptions) {
        if (sub.endDate < now && sub.status === 'active') {
          await sub.update({ status: 'expired' });
        }
      }

      return subscriptions;
    } catch (error) {
      console.error('[PaymentService] Error getting user subscriptions:', error.message);
      throw error;
    }
  }

  /**
   * Hủy subscription
   */
  async cancelSubscription(subscriptionId, userId) {
    try {
      const subscription = await db.Subscription.findByPk(subscriptionId);

      if (!subscription) {
        throw new Error('Subscription không tồn tại');
      }

      if (subscription.userId !== userId) {
        throw new Error('Không có quyền hủy subscription này');
      }

      await subscription.update({ status: 'cancelled' });

      console.log(`[PaymentService] Subscription cancelled: ${subscriptionId}`);
      return { success: true };
    } catch (error) {
      console.error('[PaymentService] Error cancelling subscription:', error.message);
      throw error;
    }
  }

  /**
   * Mock credit card payment
   */
  async processMockCreditCard(transactionId, cardNumber) {
    const mockCards = {
      '4111111111111111': { status: 'success', message: 'Thành công' },
      '4000000000000002': { status: 'failed', message: 'Số dư không đủ' },
      '4000002500003155': { status: 'failed', message: 'Thẻ hết hạn' }
    };

    // Simulate 2-3s processing time
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));

    const result = mockCards[cardNumber] || { status: 'failed', message: 'Thẻ không hợp lệ' };

    if (result.status === 'success') {
      await this.confirmPayment(transactionId, {
        method: 'creditcard',
        cardLast4: cardNumber.slice(-4),
        timestamp: new Date()
      });
    } else {
      await this.failPayment(transactionId, result.message);
    }

    return result;
  }
}

module.exports = new PaymentService();
