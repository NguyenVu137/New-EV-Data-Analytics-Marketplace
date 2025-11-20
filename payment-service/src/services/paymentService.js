const db = require('../models');
const { Op } = require('sequelize');
const axios = require('axios');

/**
 * Xử lý logic thanh toán
 */
class PaymentService {
  /**
   * Tạo đơn hàng mới
   */
  async createOrder(userId, datasetId, packageType) {
    try {
      // Kiểm tra dataset tồn tại bằng cách call API dataset-service
      let dataset;
      try {
        const response = await axios.get(`http://dataset-service:7002/api/datasets/${datasetId}`);
        dataset = response.data.data || response.data;
      } catch (error) {
        console.error('[PaymentService] Error fetching dataset:', error.message);
        throw new Error('Dataset không tồn tại');
      }

      if (!dataset) {
        throw new Error('Dataset không tồn tại');
      }

      // Lấy giá dựa vào loại gói
      const priceMap = {
        basic: dataset.basic_price,
        standard: dataset.standard_price,
        premium: dataset.premium_price
      };

      const amount = priceMap[packageType];
      if (!amount) {
        throw new Error('Gói dữ liệu không hợp lệ');
      }

      // Tạo đơn hàng
      const order = await db.Order.create({
        userId,
        datasetId,
        packageType,
        amount,
        status: 'pending'
      });

      console.log(`[PaymentService] Đơn hàng được tạo: ${order.id} cho người dùng ${userId}`);
      return order;
    } catch (error) {
      console.error('[PaymentService] Lỗi tạo đơn hàng:', error.message);
      throw error;
    }
  }

  /**
   * Khởi tạo thanh toán
   */
  async initiatePayment(orderId, paymentMethod) {
    try {
      // Kiểm tra đơn hàng tồn tại
      const order = await db.Order.findByPk(orderId);
      // Don't include Dataset as it's in different database
      // const order = await db.Order.findByPk(orderId, {
      //   include: [{ model: db.Dataset, as: 'dataset' }]
      // });

      if (!order) {
        throw new Error('Đơn hàng không tồn tại');
      }

      if (order.status !== 'pending') {
        throw new Error('Trạng thái đơn hàng không hợp lệ');
      }

      // Tạo ID giao dịch
      const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Tạo bản ghi thanh toán
      const payment = await db.Payment.create({
        orderId,
        paymentMethod,
        transactionId,
        amount: order.amount,
        status: 'pending'
      });

      console.log(`[PaymentService] Thanh toán được khởi tạo: ${payment.id} (${transactionId})`);
      return {
        id: payment.id,
        orderId,
        transactionId,
        amount: order.amount,
        status: 'pending'
      };
    } catch (error) {
      console.error('[PaymentService] Lỗi khởi tạo thanh toán:', error.message);
      throw error;
    }
  }



  /**
   * Cập nhật trạng thái thanh toán (thành công hoặc thất bại)
   */
  async updatePaymentStatus(transactionId, status, details = {}) {
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

      // Cập nhật thanh toán
      await payment.update({
        status,
        paymentGatewayResponse: details
      });

      // Lấy đơn hàng
      const order = await db.Order.findByPk(payment.orderId);
      const orderStatus = status === 'success' ? 'confirmed' : 'failed';
      await order.update({ status: orderStatus });

      // Nếu thành công: tạo gói đăng ký + ghi sổ giao dịch
      if (status === 'success') {
        // Tạo gói đăng ký nếu là loại standard hoặc premium
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

          console.log(`[PaymentService] Gói đăng ký được tạo cho người dùng ${order.userId}`);
        }

        // Tạo bản ghi giao dịch
        await db.Transaction.create({
          userId: order.userId,
          orderId: order.id,
          paymentId: payment.id,
          type: 'purchase',
          amount: payment.amount,
          status: 'success',
          description: `Mua gói ${order.packageType} - Dataset ${order.datasetId}`
        });

        console.log(`[PaymentService] Thanh toán được xác nhận: ${transactionId}`);
      } else {
        console.log(`[PaymentService] Thanh toán thất bại: ${transactionId} - ${details.reason || 'Không rõ'}`);
      }

      return { success: true, payment };
    } catch (error) {
      console.error('[PaymentService] Lỗi cập nhật trạng thái thanh toán:', error.message);
      throw error;
    }
  }

  //
  async confirmPayment(transactionId, paymentDetails = {}) {
    return this.updatePaymentStatus(transactionId, 'success', paymentDetails);
  }
  //
  async failPayment(transactionId, reason = 'Unknown') {
    return this.updatePaymentStatus(transactionId, 'failed', { reason });
  }

  /**
   * Lấy lịch sử đơn hàng của người dùng
   */
  async getUserOrders(userId, limit = 20, offset = 0) {
    try {
      const { rows, count } = await db.Order.findAndCountAll({
        where: { userId },
        include: [
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
      console.error('[PaymentService] Lỗi lấy lịch sử đơn hàng:', error.message);
      throw error;
    }
  }

  /**
   * Lấy gói đăng ký của người dùng
   */
  async getUserSubscriptions(userId) {
    try {
      const subscriptions = await db.Subscription.findAll({
        where: { userId, status: 'active' },
        include: [
          {
            model: db.Order,
            as: 'order',
            attributes: ['id', 'amount', 'status']
          }
        ],
        order: [['endDate', 'ASC']]
      });

      // Kiểm tra gói đăng ký hết hạn
      const now = new Date();
      for (const sub of subscriptions) {
        if (sub.endDate < now && sub.status === 'active') {
          await sub.update({ status: 'expired' });
        }
      }

      // Fetch dataset info for each subscription
      for (const sub of subscriptions) {
        try {
          const response = await axios.get(`http://dataset-service:7002/api/datasets/${sub.datasetId}`);
          const dataset = response.data?.data || response.data;
          sub.dataValues.dataset = dataset || { name: 'Dataset', id: sub.datasetId };
        } catch (error) {
          console.log(`[PaymentService] Could not fetch dataset ${sub.datasetId}:`, error.message);
          sub.dataValues.dataset = { name: 'Dataset', id: sub.datasetId };
        }
      }

      return subscriptions;
    } catch (error) {
      console.error('[PaymentService] Lỗi lấy danh sách gói đăng ký:', error.message);
      throw error;
    }
  }

  /**
   * Tải xuống dữ liệu từ gói đăng ký
   */
  async downloadSubscriptionData(subscriptionId, userId) {
    try {
      const subscription = await db.Subscription.findByPk(subscriptionId);
      // Don't include Dataset - it's in different database

      if (!subscription) {
        throw new Error('Gói đăng ký không tồn tại');
      }

      if (subscription.userId !== userId) {
        throw new Error('Không có quyền truy cập dữ liệu này');
      }

      if (subscription.status !== 'active') {
        throw new Error('Gói đăng ký đã hết hạn hoặc bị hủy');
      }

      // Fetch dataset data from dataset-service
      let datasets = [];
      try {
        const response = await axios.get(`http://dataset-service:7002/api/datasets/${subscription.datasetId}`);
        const dataset = response.data?.data || response.data;
        if (dataset) {
          datasets = [dataset];
        }
      } catch (error) {
        console.log('[PaymentService] Could not fetch dataset from dataset-service:', error.message);
      }

      if (datasets.length === 0) {
        throw new Error('Không tìm thấy dữ liệu');
      }

      // Tạo nội dung CSV từ dataset thực tế
      const dataset = datasets[0];
      const csvHeader = 'ID,Name,Type,Region,Created At,Status\n';
      const csvRows = `"${dataset.id}","${dataset.name || 'N/A'}","${dataset.data_type || 'N/A'}","${dataset.region || 'N/A'}","${dataset.createdAt || ''}","active"`;
      const csvData = csvHeader + csvRows + '\n';

      console.log(`[PaymentService] Dữ liệu được tải xuống: ${subscriptionId}`);
      return csvData;
    } catch (error) {
      console.error('[PaymentService] Lỗi tải xuống dữ liệu:', error.message);
      throw error;
    }
  }

  /**
   * Thanh toán bằng thẻ tín dụng mock - dùng cho kiểm tra
   */
  async processMockCreditCard(transactionId, cardNumber) {
    const mockCards = {
      '9111111111111111': { status: 'success', message: 'Thành công' },
      '9111111111111112': { status: 'failed', message: 'Số dư không đủ' },
      '9111111111111113': { status: 'failed', message: 'Thẻ hết hạn' }
    };

    // Mô phỏng thời gian xử lý 2-3s
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));

    const result = mockCards[cardNumber] || { status: 'failed', message: 'Thẻ không hợp lệ' };

    if (result.status === 'success') {
      await this.updatePaymentStatus(transactionId, 'success', {
        method: 'creditcard',
        cardLast4: cardNumber.slice(-4),
        timestamp: new Date()
      });
    } else {
      await this.updatePaymentStatus(transactionId, 'failed', { reason: result.message });
    }

    return result;
  }
}

// Export singleton
module.exports = new PaymentService();
