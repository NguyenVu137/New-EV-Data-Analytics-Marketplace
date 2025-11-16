/**
 * Mock Payment Gateway Service - Credit Card Only
 * Giả lập payment gateway cho thẻ tín dụng
 */

class MockPaymentGateway {
  /**
   * Mock Credit Card Payment
   * Card numbers cho testing:
   * - 4111111111111111 -> Success ✅
   * - 4000000000000002 -> Failed (Insufficient funds) ❌
   * - 4000002500003155 -> Failed (Card expired) ❌
   */
  async processCard(cardNumber, expiryDate, cvv) {
    return new Promise((resolve, reject) => {
      // Simulate network delay (2-3s)
      setTimeout(() => {
        const testCards = {
          '4111111111111111': { status: 'success', message: 'Giao dịch thành công' },
          '4000000000000002': { status: 'failed', message: 'Số dư không đủ' },
          '4000002500003155': { status: 'failed', message: 'Thẻ hết hạn' }
        };

        const result = testCards[cardNumber] || {
          status: 'failed',
          message: 'Thẻ không hợp lệ'
        };

        // Validate card format
        if (!/^\d{13,19}$/.test(cardNumber)) {
          return reject(new Error('Số thẻ không hợp lệ'));
        }

        if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
          return reject(new Error('Ngày hết hạn không hợp lệ'));
        }

        if (!/^\d{3,4}$/.test(cvv)) {
          return reject(new Error('CVV không hợp lệ'));
        }

        resolve({
          transactionId: `CARD_${Date.now()}`,
          status: result.status,
          message: result.message,
          cardLast4: cardNumber.slice(-4),
          timestamp: new Date().toISOString()
        });
      }, 2000 + Math.random() * 1000); // 2-3s delay
    });
  }
}

module.exports = new MockPaymentGateway();
