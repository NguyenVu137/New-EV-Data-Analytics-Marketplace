# PAYOUT SYSTEM TESTING GUIDE

## 🧪 MANUAL TESTING STEPS

### Prerequisites:
1. Backend running on `http://localhost:8080`
2. Frontend running on `http://localhost:3000`
3. Database with:
   - At least 1 Admin user (role: R1)
   - At least 1 Provider user (role: R2)
   - At least 1 Consumer user (role: R3)
   - At least 1 approved dataset (status: S2)

---

## TEST CASE 1: Consumer Purchase → Auto Payout Creation

### Step 1: Login as Consumer (R3)
```
URL: http://localhost:3000/login
Credentials: Your consumer account
```

### Step 2: Browse and Purchase Dataset
```
URL: http://localhost:3000/home
Action:
1. Click on a featured dataset
2. Click "Mua ngay" button
3. Select package: BASIC, STANDARD, or PREMIUM
4. Click "Xác nhận mua"
```

### Step 3: Verify Transaction Created
```
Expected Backend Console Output:
✅ Transaction created with ID: X
✅ Auto-processing payment in development mode...
✅ Payment processed successfully
✅ Payout created with ID: Y for provider Z
✅ Access granted to consumer
```

### Step 4: Check Database
```sql
-- Check transaction
SELECT * FROM transactions WHERE id = X;
-- Expected: payment_status_code = 'P2' (COMPLETED)

-- Check payout
SELECT * FROM payouts WHERE transaction_id = X;
-- Expected: payout_status_code = 'PO1' (PENDING)
-- Expected: net_amount = transaction.amount * 0.89
```

**✅ SUCCESS CRITERIA:**
- Transaction created with status P2
- Payout created with status PO1
- Provider balance increased by net_amount
- Consumer can download dataset

---

## TEST CASE 2: Provider View Balance and Payouts

### Step 1: Login as Provider (R2)
```
URL: http://localhost:3000/login
Credentials: Your provider account (must be the owner of purchased dataset)
```

### Step 2: Navigate to My Payouts
```
URL: http://localhost:3000/system/my-payouts
Or: Click menu "Thu nhập" → "Quản lý thu nhập"
```

### Step 3: Verify Balance Display
```
Expected to see:
┌─────────────────────────────────┐
│ Total Balance: XXX,XXX VND     │
│ Available: XXX,XXX VND         │
│ Pending: 0 VND                 │
│ Completed: 0 VND               │
└─────────────────────────────────┘
```

### Step 4: Verify Payout List
```
Expected to see table with:
- Transaction ID
- Dataset name
- Consumer info
- Amount breakdown (Platform fee, Payment fee, Net amount)
- Status badge: "Chờ yêu cầu" (PO1)
- Created date
```

**✅ SUCCESS CRITERIA:**
- Balance matches sum of all PO1 payouts
- All payouts from your datasets are visible
- Amount breakdown is correct (10% + 1% fees)

---

## TEST CASE 3: Provider Request Withdrawal

### Step 1: Select Payouts
```
In /system/my-payouts page:
1. Check checkboxes for payouts you want to withdraw
2. Click "Yêu cầu rút tiền" button
```

### Step 2: Fill Bank Info
```
Modal appears with form:
- Bank Name: e.g., "Vietcombank"
- Account Number: e.g., "0123456789"
- Note (optional): e.g., "Rút tiền tháng 1/2024"

Click "Xác nhận rút tiền"
```

### Step 3: Verify Request Submitted
```
Expected:
- Success toast: "Yêu cầu rút tiền thành công"
- Selected payouts status changed: PO1 → PO2
- Balance updated:
  * Available decreased
  * Pending increased by same amount
```

### Step 4: Check Database
```sql
SELECT * FROM payouts WHERE id IN (selected_ids);
-- Expected: payout_status_code = 'PO2' (PROCESSING)
-- Expected: bank_name and bank_account filled

SELECT * FROM notifications WHERE user_id = provider_id;
-- Expected: New notification about withdrawal request
```

**✅ SUCCESS CRITERIA:**
- Payouts moved from PO1 to PO2
- Bank info saved correctly
- Balance reflects pending status
- Notification created

---

## TEST CASE 4: Admin View Statistics

### Step 1: Login as Admin (R1)
```
URL: http://localhost:3000/login
Credentials: Your admin account
```

### Step 2: Navigate to Manage Payouts
```
URL: http://localhost:3000/system/manage-payouts
Or: Click menu "Thanh toán" → "Quản lý thanh toán"
```

### Step 3: Verify Statistics Cards
```
Expected to see cards:
┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐
│ Tổng đã chi        │ │ Phí nền tảng       │ │ Phí thanh toán     │
│ XXX,XXX VND        │ │ XXX,XXX VND        │ │ XXX,XXX VND        │
└────────────────────┘ └────────────────────┘ └────────────────────┘

┌────────────────────┐ ┌────────────────────┐
│ Chờ yêu cầu        │ │ Đang xử lý         │
│ X yêu cầu          │ │ X yêu cầu          │
│ XXX,XXX VND        │ │ XXX,XXX VND        │
└────────────────────┘ └────────────────────┘
```

### Step 4: Verify Payout Table
```
Expected to see table with:
- All payouts (default filter: PO2 - Processing)
- Provider info (name, email)
- Dataset info
- Amount breakdown
- Bank info
- Status badge
- Action buttons (Approve, Reject)
```

**✅ SUCCESS CRITERIA:**
- Statistics match database totals
- All pending payouts (PO2) are visible
- Filters work correctly
- Data refreshes on button click

---

## TEST CASE 5: Admin Approve Payout

### Step 1: Click Approve Button
```
In /system/manage-payouts table:
1. Find a payout with status PO2
2. Click green check button (Approve)
```

### Step 2: Fill Approval Note
```
Modal appears showing:
- Provider info
- Amount
- Bank info

Note field (optional): "Đã chuyển khoản vào TK 0123456789"

Click "Xác nhận duyệt"
```

### Step 3: Verify Approval Success
```
Expected:
- Success toast: "Đã duyệt payout thành công"
- Payout removed from PO2 list (or status changed to PO3)
- Statistics updated
```

### Step 4: Check Database
```sql
SELECT * FROM payouts WHERE id = payout_id;
-- Expected: payout_status_code = 'PO3' (COMPLETED)
-- Expected: processed_at timestamp set
-- Expected: note field updated

SELECT * FROM notifications WHERE user_id = provider_id;
-- Expected: New notification about approval
```

### Step 5: Verify Provider Receives Notification
```
As Provider, check:
1. Balance → Pending decreased, Completed increased
2. Payout list → Status changed to "Đã hoàn thành"
3. Notification (if implemented)
```

**✅ SUCCESS CRITERIA:**
- Payout status: PO2 → PO3
- Provider balance updated correctly
- Notification sent to provider
- Admin note saved

---

## TEST CASE 6: Admin Reject Payout

### Step 1: Click Reject Button
```
In /system/manage-payouts table:
1. Find a payout with status PO2
2. Click red X button (Reject)
```

### Step 2: Fill Rejection Reason
```
Modal appears:
Note field (required): "Thông tin tài khoản không chính xác"

Click "Xác nhận từ chối"
```

### Step 3: Verify Rejection Success
```
Expected:
- Success toast: "Đã từ chối payout"
- Payout removed from PO2 list
- Statistics updated
```

### Step 4: Check Database
```sql
SELECT * FROM payouts WHERE id = payout_id;
-- Expected: payout_status_code = 'PO4' (FAILED)
-- Expected: note = rejection reason

SELECT * FROM notifications WHERE user_id = provider_id;
-- Expected: Notification with rejection reason
```

### Step 5: Verify Provider Sees Rejection
```
As Provider:
1. Balance → Pending decreased, Available stays same (payout back to PO1? or PO4?)
2. Payout list → Status "Đã từ chối" with reason
```

**✅ SUCCESS CRITERIA:**
- Payout status: PO2 → PO4
- Rejection reason saved
- Provider notified with reason
- Provider can potentially re-request (depends on business logic)

---

## TEST CASE 7: Filter and Search

### Admin Tests:
```
In /system/manage-payouts:
1. Filter by status: PO1, PO2, PO3, PO4, PO5
2. Click "Làm mới" to refresh data
3. Verify counts match statistics
```

### Provider Tests:
```
In /system/my-payouts:
1. Filter by status
2. Search by dataset name (if implemented)
3. Check balance recalculation
```

**✅ SUCCESS CRITERIA:**
- Filters work correctly
- Counts match filtered results
- Refresh updates data

---

## 🔍 EDGE CASES TO TEST

### 1. Empty States
- New provider with no sales → Balance = 0, No payouts
- Admin with no pending requests → Empty table with message

### 2. Multi-Transaction Scenario
- Consumer buys 3 different datasets from same provider
- Provider should see 3 separate PO1 payouts
- Provider can batch withdraw all 3 at once

### 3. Permission Tests
- Consumer (R3) tries to access `/system/my-payouts` → Should redirect
- Provider (R2) tries to access `/system/manage-payouts` → Should redirect
- Admin (R1) should access all pages

### 4. Invalid Withdrawal Request
- Provider tries to withdraw already-processed payout → Error
- Provider tries to withdraw someone else's payout → Error

### 5. Amount Calculations
- Verify: Platform Fee + Payment Fee + Net Amount = Transaction Amount
- Verify: Provider balance = SUM of all PO1 net_amounts

---

## 📊 DATABASE VERIFICATION QUERIES

### Check Payout Flow:
```sql
-- View all payouts with status progression
SELECT 
    p.id,
    p.transaction_id,
    p.provider_id,
    u.email as provider_email,
    t.amount as transaction_amount,
    p.platform_fee,
    p.payment_fee,
    p.net_amount,
    p.payout_status_code,
    ac.valueVi as status_name,
    p.created_at,
    p.processed_at
FROM payouts p
JOIN users u ON p.provider_id = u.id
JOIN transactions t ON p.transaction_id = t.id
JOIN allcodes ac ON p.payout_status_code = ac.key
ORDER BY p.created_at DESC;
```

### Check Provider Balance:
```sql
-- Available balance (PO1)
SELECT provider_id, SUM(net_amount) as available
FROM payouts
WHERE payout_status_code = 'PO1'
GROUP BY provider_id;

-- Pending balance (PO2)
SELECT provider_id, SUM(net_amount) as pending
FROM payouts
WHERE payout_status_code = 'PO2'
GROUP BY provider_id;

-- Completed balance (PO3)
SELECT provider_id, SUM(net_amount) as completed
FROM payouts
WHERE payout_status_code = 'PO3'
GROUP BY provider_id;
```

### Check Revenue Split:
```sql
-- Verify calculations
SELECT 
    t.id as transaction_id,
    t.amount,
    p.platform_fee,
    p.payment_fee,
    p.net_amount,
    (p.platform_fee + p.payment_fee + p.net_amount) as sum_check,
    (t.amount - (p.platform_fee + p.payment_fee + p.net_amount)) as difference
FROM transactions t
JOIN payouts p ON t.id = p.transaction_id
WHERE (t.amount - (p.platform_fee + p.payment_fee + p.net_amount)) != 0;
-- Should return 0 rows (no differences)
```

---

## 🐛 COMMON ISSUES AND SOLUTIONS

### Issue 1: Payout not created after transaction
**Symptoms**: Transaction completes but no payout in database
**Check**:
- Transaction payment_status_code = 'P2'?
- Dataset has valid provider_id?
- Backend console for errors in `createPayoutForProvider()`
**Fix**: Manually call processPaymentCallback() or check transaction service

### Issue 2: Balance not updating
**Symptoms**: Provider balance doesn't reflect new payouts
**Check**:
- Frontend calling correct API endpoint?
- API response includes all status codes?
- Sequelize query using correct WHERE clause?
**Fix**: Check `getProviderBalance()` in payoutService.js

### Issue 3: Admin can't see pending payouts
**Symptoms**: Empty table even though PO2 payouts exist
**Check**:
- Admin role = 'R1'?
- Payouts have payout_status_code = 'PO2'?
- API returns data but frontend not rendering?
**Fix**: Check getAllPayouts() query and frontend state management

### Issue 4: Withdrawal request fails
**Symptoms**: Error when clicking "Yêu cầu rút tiền"
**Check**:
- Selected payouts have status PO1?
- Bank info validation passing?
- Transaction rollback on error?
**Fix**: Check requestWithdrawal() service and frontend validation

---

## ✅ TESTING CHECKLIST

- [ ] Consumer can purchase dataset
- [ ] Transaction auto-completes in dev mode
- [ ] Payout auto-created with PO1 status
- [ ] Provider can view balance (available/pending/completed)
- [ ] Provider can view payout history
- [ ] Provider can select multiple payouts
- [ ] Provider can request withdrawal with bank info
- [ ] Payouts move from PO1 to PO2
- [ ] Admin can view statistics
- [ ] Admin can view pending payouts (PO2)
- [ ] Admin can approve payout (PO2 → PO3)
- [ ] Admin can reject payout (PO2 → PO4)
- [ ] Admin approval note is saved
- [ ] Provider receives notification after approval/rejection
- [ ] Balance calculations are correct
- [ ] Revenue split is accurate (10% + 1% + 89%)
- [ ] Filters work on both admin and provider pages
- [ ] Refresh button updates data
- [ ] Empty states display correctly
- [ ] Role-based access control works
- [ ] Multi-transaction scenario works
- [ ] UI is responsive on mobile

---

## 📝 TEST REPORT TEMPLATE

```
TEST DATE: __________
TESTER: __________

TEST CASE 1: Consumer Purchase → Auto Payout
Status: [ ] PASS [ ] FAIL
Notes: ________________________________

TEST CASE 2: Provider View Balance
Status: [ ] PASS [ ] FAIL
Notes: ________________________________

TEST CASE 3: Provider Request Withdrawal
Status: [ ] PASS [ ] FAIL
Notes: ________________________________

TEST CASE 4: Admin View Statistics
Status: [ ] PASS [ ] FAIL
Notes: ________________________________

TEST CASE 5: Admin Approve Payout
Status: [ ] PASS [ ] FAIL
Notes: ________________________________

TEST CASE 6: Admin Reject Payout
Status: [ ] PASS [ ] FAIL
Notes: ________________________________

TEST CASE 7: Filter and Search
Status: [ ] PASS [ ] FAIL
Notes: ________________________________

OVERALL STATUS: [ ] ALL PASS [ ] NEEDS FIX
CRITICAL ISSUES: ________________________________
MINOR ISSUES: ________________________________
```

---

**TESTING STATUS**: Ready for manual testing
**RECOMMENDED ORDER**: Follow test cases 1-7 in sequence
**ESTIMATED TIME**: 30-45 minutes for complete test suite
