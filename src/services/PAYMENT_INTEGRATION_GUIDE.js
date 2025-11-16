
// POST /api/payments/:orderId
const initiatePaymentPayload = {
  "paymentMethod": "creditcard" 
};

// POST /api/payments/creditcard
const creditCardPayload = {
  "transactionId": "TXN_1634567890",
  "cardNumber": "4111111111111111",
  "expiryDate": "12/25",
  "cvv": "123",
  "cardHolder": "NGUYEN PHUNG THANG"
};

/*
 * 
 * Để demo với card:
 *   - Card: 4111111111111111
 *   - Exp: 12/25
 *   - CVV: 123
 *   - Result: Success sau 2-3s
 */

module.exports = {
  guides: {
    momo: 'See MOMO INTEGRATION section',
    zalopay: 'See ZALOPAY INTEGRATION section',
    creditCard: 'See CREDIT CARD INTEGRATION section'
  }
};
