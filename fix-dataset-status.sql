-- Fix dataset status codes to use allcode
UPDATE datasets SET status_code = 'S1' WHERE status_code = 'PENDING';

UPDATE datasets
SET
    status_code = 'S2'
WHERE
    status_code = 'APPROVED';

UPDATE datasets
SET
    status_code = 'S3'
WHERE
    status_code = 'REJECTED';

-- Fix subscription status codes
UPDATE subscriptions
SET
    status_code = 'SUB1'
WHERE
    status_code = 'ACTIVE';

UPDATE subscriptions
SET
    status_code = 'SUB2'
WHERE
    status_code = 'EXPIRED';

UPDATE subscriptions
SET
    status_code = 'SUB3'
WHERE
    status_code = 'CANCELLED';

-- Fix transaction payment status codes
UPDATE transactions
SET
    payment_status_code = 'P1'
WHERE
    payment_status_code = 'PENDING';

UPDATE transactions
SET
    payment_status_code = 'P2'
WHERE
    payment_status_code = 'COMPLETED'
    OR payment_status_code = 'SUCCESS';

UPDATE transactions
SET
    payment_status_code = 'P3'
WHERE
    payment_status_code = 'FAILED';

-- Fix payout status codes
UPDATE payouts
SET
    payout_status_code = 'PO1'
WHERE
    payout_status_code = 'PENDING';

UPDATE payouts
SET
    payout_status_code = 'PO2'
WHERE
    payout_status_code = 'PROCESSING';

UPDATE payouts
SET
    payout_status_code = 'PO3'
WHERE
    payout_status_code = 'COMPLETED';

UPDATE payouts
SET
    payout_status_code = 'PO4'
WHERE
    payout_status_code = 'FAILED';

UPDATE payouts
SET
    payout_status_code = 'PO5'
WHERE
    payout_status_code = 'CANCELLED';

SELECT 'Dataset status fixed' as message;