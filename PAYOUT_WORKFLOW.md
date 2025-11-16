# PAYOUT WORKFLOW COMPLETE DOCUMENTATION

## 📋 OVERVIEW
Hệ thống thanh toán và chia sẻ lợi nhuận đã được hoàn thiện với các chức năng:
- Tự động tạo payout khi giao dịch thành công
- Provider xem và yêu cầu rút tiền
- Admin quản lý và duyệt yêu cầu rút tiền

---

## 💰 REVENUE SHARING MODEL

### Commission Structure:
- **Platform Fee**: 10% của transaction amount
- **Payment Fee**: 1% của transaction amount  
- **Provider Net**: 89% của transaction amount

### Example:
```
Transaction Amount: 100,000 VND
├── Platform Fee: 10,000 VND (10%)
├── Payment Fee: 1,000 VND (1%)
└── Provider Net: 89,000 VND (89%)
```

---

## 🔄 AUTOMATIC PAYOUT WORKFLOW

### 1. Transaction Creation (Consumer mua dataset)
**File**: `backend/src/services/transactionService.js`
**Function**: `createTransaction()`

```javascript
// Consumer mua dataset → Tạo transaction với status P1 (PENDING)
const transaction = await db.Transaction.create({
    consumer_id: consumerId,
    dataset_id: datasetId,
    amount: price,
    payment_status_code: 'P1', // PENDING
    type_code: 'T1' // DOWNLOAD
});
```

### 2. Auto Payment Processing (Development Mode)
**File**: `backend/src/services/transactionService.js`
**Function**: `createTransaction()` → auto-complete in dev

```javascript
// Automatically complete payment in dev mode
if (process.env.NODE_ENV === 'development') {
    await processPaymentCallback(transaction.id, 'success', dbTransaction);
}
```

### 3. Payment Callback Processing
**File**: `backend/src/services/transactionService.js`
**Function**: `processPaymentCallback()`

```javascript
// Update transaction status P1 → P2
await transaction.update({
    payment_status_code: 'P2', // COMPLETED
    paid_at: new Date()
});

// Automatically create payout for provider
const payout = await createPayoutForProvider(transaction, dbTransaction);

// Grant dataset access to consumer
await grantDatasetAccess(transaction, dbTransaction);
```

### 4. Payout Creation
**File**: `backend/src/services/transactionService.js`
**Function**: `createPayoutForProvider()`

```javascript
const platformFee = txn.amount * 0.10;  // 10%
const paymentFee = txn.amount * 0.01;   // 1%
const netAmount = txn.amount * 0.89;    // 89%

const payout = await db.Payout.create({
    transaction_id: txn.id,
    provider_id: dataset.provider_id,
    platform_fee: platformFee,
    payment_fee: paymentFee,
    net_amount: netAmount,
    payout_status_code: 'PO1' // PENDING
});
```

---

## 🎯 PAYOUT STATUS FLOW

```
PO1 (PENDING) 
    ↓ Provider requests withdrawal
PO2 (PROCESSING)
    ↓ Admin approves/rejects
PO3 (COMPLETED) or PO4 (FAILED)
```

### Status Definitions:
- **PO1 (PENDING)**: Payout đã tạo, chờ provider yêu cầu rút
- **PO2 (PROCESSING)**: Provider đã yêu cầu rút tiền, chờ admin duyệt
- **PO3 (COMPLETED)**: Admin đã duyệt và chuyển khoản thành công
- **PO4 (FAILED)**: Admin từ chối yêu cầu rút tiền
- **PO5 (CANCELLED)**: Yêu cầu bị hủy

---

## 👨‍💼 PROVIDER WORKFLOW

### 1. View Balance and Payouts
**URL**: `/system/my-payouts` (Frontend route)
**API**: `GET /api/payout/balance`

**Response**:
```json
{
    "errCode": 0,
    "message": "Lấy số dư thành công",
    "data": {
        "available": 267000,    // Có thể rút (PO1)
        "pending": 0,           // Đang xử lý (PO2)
        "completed": 0,         // Đã nhận (PO3)
        "total": 267000
    }
}
```

### 2. View Payout History
**API**: `GET /api/payout/my-payouts?status=PO1&limit=50&offset=0`

**Response**:
```json
{
    "errCode": 0,
    "message": "Lấy danh sách payout thành công",
    "data": [
        {
            "id": 1,
            "transaction_id": 5,
            "provider_id": 2,
            "platform_fee": 10000,
            "payment_fee": 1000,
            "net_amount": 89000,
            "payout_status_code": "PO1",
            "created_at": "2024-01-15T10:30:00.000Z",
            "transaction": {
                "dataset": {
                    "title": "Battery Performance Dataset",
                    "category_code": "CAR1"
                },
                "consumer": {
                    "email": "consumer@example.com",
                    "firstName": "John",
                    "lastName": "Doe"
                }
            }
        }
    ],
    "total": 3
}
```

### 3. Request Withdrawal
**API**: `POST /api/payout/withdraw`

**Request Body**:
```json
{
    "payout_ids": [1, 2, 3],
    "bank_info": {
        "account_number": "0123456789",
        "bank_name": "Vietcombank",
        "note": "Rút tiền tháng 1/2024"
    }
}
```

**Response**:
```json
{
    "errCode": 0,
    "message": "Yêu cầu rút tiền thành công",
    "data": {
        "totalAmount": "267000.00",
        "payoutCount": 3,
        "status": "Processing (chờ Admin duyệt)"
    }
}
```

**Backend Process**:
1. Validate payouts belong to provider and have status PO1
2. Update payouts: PO1 → PO2 (PROCESSING)
3. Save bank account info
4. Create notification for provider
5. Return success response

---

## 👨‍💻 ADMIN WORKFLOW

### 1. View Statistics
**URL**: `/system/manage-payouts` (Frontend route)
**API**: `GET /api/payout/admin/statistics`

**Response**:
```json
{
    "errCode": 0,
    "message": "Lấy thống kê thành công",
    "data": {
        "byStatus": [
            {
                "payout_status_code": "PO1",
                "status_name": "Chờ yêu cầu",
                "count": 5,
                "total_amount": 445000
            },
            {
                "payout_status_code": "PO2",
                "status_name": "Đang xử lý",
                "count": 2,
                "total_amount": 178000
            }
        ],
        "totals": {
            "payout": 623000,
            "platformFee": 70000,
            "paymentFee": 7000
        }
    }
}
```

### 2. View Pending Payouts (PO2)
**API**: `GET /api/payout/admin/pending?limit=50&offset=0`

**Response**:
```json
{
    "errCode": 0,
    "message": "Lấy danh sách payout thành công",
    "data": [
        {
            "id": 1,
            "provider_id": 2,
            "net_amount": 89000,
            "bank_name": "Vietcombank",
            "bank_account": "0123456789",
            "payout_status_code": "PO2",
            "created_at": "2024-01-15T10:30:00.000Z",
            "provider": {
                "id": 2,
                "email": "provider@example.com",
                "firstName": "Jane",
                "lastName": "Smith"
            },
            "transaction": {
                "dataset": {
                    "title": "Battery Performance Dataset"
                }
            }
        }
    ],
    "total": 2
}
```

### 3. View All Payouts (with filter)
**API**: `GET /api/payout/admin/all?status=PO3&limit=50&offset=0`

### 4. Approve Payout
**API**: `POST /api/payout/admin/process/:payoutId`

**Request Body**:
```json
{
    "action": "approve",
    "note": "Đã chuyển khoản vào tài khoản 0123456789"
}
```

**Backend Process**:
1. Validate payout exists and has status PO2
2. Update payout: PO2 → PO3 (COMPLETED)
3. Set processed_at timestamp
4. Create notification for provider
5. Return success response

### 5. Reject Payout
**Request Body**:
```json
{
    "action": "reject",
    "note": "Thông tin tài khoản không chính xác"
}
```

**Backend Process**:
1. Validate payout exists and has status PO2
2. Update payout: PO2 → PO4 (FAILED)
3. Save rejection note
4. Create notification for provider
5. Return success response

---

## 📁 KEY FILES

### Backend:
```
backend/src/
├── controllers/
│   └── payoutController.js         # HTTP endpoints
├── services/
│   ├── payoutService.js            # Business logic
│   └── transactionService.js       # Auto payout creation
├── route/
│   └── payoutRoutes.js             # API routes
└── models/
    └── payout.js                   # Database model
```

### Frontend:
```
frontend/src/
├── containers/System/
│   ├── Admin/
│   │   ├── ManagePayouts.js        # Admin payout management
│   │   └── ManagePayouts.scss
│   ├── ProviderPayout.js           # Provider earnings
│   ├── ProviderPayout.scss
│   ├── PurchaseDataset.js          # Consumer purchases
│   └── PurchaseDataset.scss
├── services/
│   └── payoutService.js            # API calls
├── routes/
│   └── System.js                   # Route config
└── translations/
    ├── vi.json                     # Vietnamese
    └── en.json                     # English
```

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### Role-based Access:
- **Admin (R1)**: Full access to all payout management
- **Provider (R2)**: View own payouts and request withdrawals
- **Consumer (R3)**: View purchase history only

### API Security:
All payout endpoints require:
```javascript
router.get('/my-payouts',
    auth,                    // Check JWT token
    checkRole(['R2']),       // Check user role
    payoutController.getMyPayouts
);
```

---

## 🧪 TESTING WORKFLOW

### 1. Test Transaction → Payout Creation
```bash
# As Consumer (R3), purchase a dataset
POST /api/transaction/create
{
    "datasetId": 1,
    "packageType": "BASIC"
}

# ✅ Expected: 
# - Transaction created with P1 → auto P2 (dev mode)
# - Payout created with PO1 status
# - Consumer gets download access
```

### 2. Test Provider Withdrawal Request
```bash
# As Provider (R2), view balance
GET /api/payout/balance

# Request withdrawal
POST /api/payout/withdraw
{
    "payout_ids": [1, 2],
    "bank_info": {
        "account_number": "0123456789",
        "bank_name": "Vietcombank"
    }
}

# ✅ Expected:
# - Payouts updated: PO1 → PO2
# - Notification created for provider
```

### 3. Test Admin Approval
```bash
# As Admin (R1), view pending payouts
GET /api/payout/admin/pending

# Approve payout
POST /api/payout/admin/process/1
{
    "action": "approve",
    "note": "Đã chuyển khoản thành công"
}

# ✅ Expected:
# - Payout updated: PO2 → PO3
# - Notification sent to provider
```

---

## 📊 DATABASE SCHEMA

### Payouts Table:
```sql
CREATE TABLE payouts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_id INT NOT NULL,
    provider_id INT NOT NULL,
    platform_fee DECIMAL(10,2),
    payment_fee DECIMAL(10,2),
    net_amount DECIMAL(10,2) NOT NULL,
    payout_status_code VARCHAR(10),
    bank_name VARCHAR(255),
    bank_account VARCHAR(255),
    note TEXT,
    processed_at DATETIME,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id),
    FOREIGN KEY (provider_id) REFERENCES users(id),
    FOREIGN KEY (payout_status_code) REFERENCES allcodes(key)
);
```

### Allcodes (PAYOUT_STATUS):
```sql
INSERT INTO allcodes (key, type, valueVi, valueEn) VALUES
('PO1', 'PAYOUT_STATUS', 'Chờ yêu cầu', 'Pending'),
('PO2', 'PAYOUT_STATUS', 'Đang xử lý', 'Processing'),
('PO3', 'PAYOUT_STATUS', 'Đã hoàn thành', 'Completed'),
('PO4', 'PAYOUT_STATUS', 'Đã từ chối', 'Failed'),
('PO5', 'PAYOUT_STATUS', 'Đã hủy', 'Cancelled');
```

---

## ✅ COMPLETED FEATURES

1. ✅ Automatic payout creation when transaction completes
2. ✅ Revenue split calculation (10% + 1% fees, 89% provider)
3. ✅ Provider balance and payout history view
4. ✅ Provider withdrawal request with bank info
5. ✅ Multi-select payouts for batch withdrawal
6. ✅ Admin payout statistics dashboard
7. ✅ Admin pending payouts view
8. ✅ Admin approve/reject workflow
9. ✅ Notifications for payout status changes
10. ✅ Role-based access control
11. ✅ Frontend UI for all workflows
12. ✅ Translation support (VI/EN)

---

## 🎨 UI FEATURES

### Provider Payout Page (`/system/my-payouts`):
- Balance overview (Available, Pending, Completed)
- Payout history with filters
- Multi-select payouts for withdrawal
- Bank info form modal
- Status badges with colors
- Responsive design

### Admin Payout Management (`/system/manage-payouts`):
- Statistics cards (Total, Platform Fee, Payment Fee)
- Status breakdown charts
- Filter by payout status
- Pending payouts table
- Approve/Reject modal with note field
- Provider and bank info display
- Real-time refresh

---

## 🔧 CONFIGURATION

### Environment Variables:
```env
NODE_ENV=development  # Auto-complete payments in dev mode
```

### Revenue Split (can be configured):
```javascript
// backend/src/services/transactionService.js
const platformFee = txn.amount * 0.10;  // Change here
const paymentFee = txn.amount * 0.01;   // Change here
const netAmount = txn.amount * 0.89;    // Auto-calculated
```

---

## 📝 NOTES

1. **Development Mode**: Payments auto-complete for testing
2. **Production Mode**: Integrate real payment gateway callback
3. **Notifications**: Currently using DB notifications, can extend to email/SMS
4. **Bank Info**: Stored in payouts table when withdrawal requested
5. **Payout Timing**: Auto-created when payment completes (P2 status)

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Update `NODE_ENV=production`
- [ ] Integrate payment gateway callback
- [ ] Set up email notifications
- [ ] Configure bank transfer automation
- [ ] Add payout retry mechanism
- [ ] Set up monitoring and alerts
- [ ] Test all workflows end-to-end
- [ ] Prepare admin training documentation

---

**Last Updated**: 2024-01-15
**Status**: ✅ COMPLETE AND READY FOR TESTING
