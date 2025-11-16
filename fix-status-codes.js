// Temporary fix script - Run once to migrate status codes
const db = require('./src/models');

async function fixStatusCodes() {
    try {
        console.log('🔧 Starting status code migration...');

        // Fix datasets
        const datasetsUpdated = await db.sequelize.query(`
            UPDATE datasets 
            SET status_code = CASE 
                WHEN status_code = 'PENDING' THEN 'S1'
                WHEN status_code = 'APPROVED' THEN 'S2'
                WHEN status_code = 'REJECTED' THEN 'S3'
                ELSE status_code
            END
            WHERE status_code IN ('PENDING', 'APPROVED', 'REJECTED')
        `);
        console.log('✅ Datasets updated:', datasetsUpdated);

        // Fix subscriptions
        const subsUpdated = await db.sequelize.query(`
            UPDATE subscriptions 
            SET status_code = CASE 
                WHEN status_code = 'ACTIVE' THEN 'SUB1'
                WHEN status_code = 'EXPIRED' THEN 'SUB2'
                WHEN status_code = 'CANCELLED' THEN 'SUB3'
                ELSE status_code
            END
            WHERE status_code IN ('ACTIVE', 'EXPIRED', 'CANCELLED')
        `);
        console.log('✅ Subscriptions updated:', subsUpdated);

        // Fix transactions
        const txnsUpdated = await db.sequelize.query(`
            UPDATE transactions 
            SET payment_status_code = CASE 
                WHEN payment_status_code = 'PENDING' THEN 'P1'
                WHEN payment_status_code IN ('COMPLETED', 'SUCCESS') THEN 'P2'
                WHEN payment_status_code = 'FAILED' THEN 'P3'
                ELSE payment_status_code
            END
            WHERE payment_status_code IN ('PENDING', 'COMPLETED', 'SUCCESS', 'FAILED')
        `);
        console.log('✅ Transactions updated:', txnsUpdated);

        // Fix payouts
        const payoutsUpdated = await db.sequelize.query(`
            UPDATE payouts 
            SET payout_status_code = CASE 
                WHEN payout_status_code = 'PENDING' THEN 'PO1'
                WHEN payout_status_code = 'PROCESSING' THEN 'PO2'
                WHEN payout_status_code = 'COMPLETED' THEN 'PO3'
                WHEN payout_status_code = 'FAILED' THEN 'PO4'
                WHEN payout_status_code = 'CANCELLED' THEN 'PO5'
                ELSE payout_status_code
            END
            WHERE payout_status_code IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED')
        `);
        console.log('✅ Payouts updated:', payoutsUpdated);

        console.log('🎉 Migration completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

fixStatusCodes();
