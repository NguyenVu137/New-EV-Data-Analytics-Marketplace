const db = require("../models");
const { Sequelize } = require('sequelize');

//  CONSTANTS 
const PLATFORM_FEE_PERCENT = 10;
const PAYMENT_FEE_PERCENT = 1;
const PROVIDER_REVENUE_PERCENT = 89;

const PACKAGE_TYPES = {
    BASIC: { typeCode: 'T1', priceField: 'basicPrice' },
    STANDARD: { typeCode: 'T1', priceField: 'standardPrice' },
    PREMIUM: { typeCode: 'T2', priceField: 'premiumPrice' }
};

//  CREATE TRANSACTION 
const createTransaction = async (consumerId, datasetId, packageType, paymentMethod) => {
    const transaction = await db.sequelize.transaction();

    try {
        console.log('💳 Creating transaction...');

        // 1. Validate dataset
        const dataset = await db.Dataset.findOne({
            where: {
                id: datasetId,
                status_code: 'S2' // APPROVED status
            },
            include: [{
                model: db.User,
                as: 'provider',
                attributes: ['id', 'email', 'firstName', 'lastName']
            }]
        });

        if (!dataset) {
            throw new Error('Dataset không tồn tại hoặc chưa được duyệt');
        }

        // 2. Validate package type
        const packageConfig = PACKAGE_TYPES[packageType.toUpperCase()];
        if (!packageConfig) {
            throw new Error('Package type không hợp lệ');
        }

        const amount = parseFloat(dataset[packageConfig.priceField]);
        if (amount <= 0) {
            throw new Error('Giá package không hợp lệ');
        }

        // 3. Check existing premium subscription
        if (packageType.toUpperCase() === 'PREMIUM') {
            const existingSub = await db.Subscription.findOne({
                where: {
                    consumer_id: consumerId,
                    data_source_id: datasetId,
                    status_code: 'SUB1', // ACTIVE
                    end_date: { [Sequelize.Op.gte]: new Date() }
                }
            });

            if (existingSub) {
                throw new Error('Bạn đã có Premium subscription active');
            }
        }

        // 4. Create transaction with PENDING status
        const newTransaction = await db.Transaction.create({
            consumer_id: consumerId,
            data_source_id: datasetId,
            type_code: packageConfig.typeCode,
            amount: amount,
            payment_status_code: 'P1', // PENDING
            payment_method: paymentMethod
        }, { transaction });

        await transaction.commit();

        console.log('✅ Transaction created:', newTransaction.id);

        // Auto-complete payment in development mode
        if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
            console.log('🔧 DEV MODE: Auto-completing payment...');
            setTimeout(async () => {
                try {
                    await processPaymentCallback(newTransaction.id, 'success');
                    console.log('✅ DEV MODE: Payment auto-completed');
                } catch (error) {
                    console.error('❌ DEV MODE: Auto-complete failed:', error);
                }
            }, 1000);
        }

        return {
            errCode: 0,
            message: 'Tạo giao dịch thành công',
            transaction: {
                id: newTransaction.id,
                amount: amount,
                dataset: dataset.title,
                provider: `${dataset.provider.firstName} ${dataset.provider.lastName}`
            }
            // paymentUrl removed - use simulatePayment for dev mode
        };

    } catch (error) {
        await transaction.rollback();
        console.error('❌ createTransaction error:', error);
        throw error;
    }
};

//  PROCESS PAYMENT CALLBACK 
const processPaymentCallback = async (transactionId, paymentStatus) => {
    const dbTransaction = await db.sequelize.transaction();

    try {
        console.log('📥 Payment callback received');
        console.log('Transaction:', transactionId);
        console.log('Status:', paymentStatus);

        // 1. Find transaction
        const txn = await db.Transaction.findByPk(transactionId, {
            include: [
                {
                    model: db.Dataset,
                    as: 'dataset',
                    include: [{
                        model: db.User,
                        as: 'provider',
                        attributes: ['id', 'email', 'firstName', 'lastName']
                    }]
                },
                {
                    model: db.User,
                    as: 'consumer',
                    attributes: ['id', 'email', 'firstName', 'lastName']
                }
            ]
        });

        if (!txn) {
            throw new Error('Transaction không tồn tại');
        }

        if (txn.payment_status_code !== 'P1') {
            throw new Error('Transaction đã được xử lý');
        }

        // 2. Update payment status
        const newStatus = paymentStatus === 'success' ? 'P2' : 'P3';
        await txn.update({ payment_status_code: newStatus }, { transaction: dbTransaction });

        console.log(`Status updated: P1 → ${newStatus}`);

        // 3. If SUCCESS → Process payout and access
        if (newStatus === 'P2') {
            console.log('💰 Processing successful payment...');

            // 3.1. Create Payout for Provider
            const payout = await createPayoutForProvider(txn, dbTransaction);
            console.log('✅ Payout created:', payout.id);

            // 3.2. Grant dataset access
            await grantDatasetAccess(txn, dbTransaction);
            console.log('✅ Access granted');

            // 3.3. Send notifications
            await createNotifications(txn, dbTransaction);
        }

        await dbTransaction.commit();

        console.log(`✅ Payment ${paymentStatus} processed`);

        return {
            errCode: 0,
            message: `Thanh toán ${paymentStatus === 'success' ? 'thành công' : 'thất bại'}`,
            transaction: txn
        };

    } catch (error) {
        await dbTransaction.rollback();
        console.error('❌ processPaymentCallback error:', error);
        throw error;
    }
};

//  CREATE PAYOUT FOR PROVIDER 
const createPayoutForProvider = async (txn, dbTransaction) => {
    try {
        const amount = parseFloat(txn.amount);
        const provider_id = txn.dataset.provider_id;

        // Calculate revenue split
        const platform_fee = Math.round((amount * PLATFORM_FEE_PERCENT) / 100 * 100) / 100;
        const payment_fee = Math.round((amount * PAYMENT_FEE_PERCENT) / 100 * 100) / 100;
        const net_amount = Math.round((amount * PROVIDER_REVENUE_PERCENT) / 100 * 100) / 100;

        console.log('💸 Revenue split:');
        console.log(`Total: ${amount} VND`);
        console.log(`Platform Fee (10%): ${platform_fee} VND`);
        console.log(`Payment Fee (1%): ${payment_fee} VND`);
        console.log(`Provider Net (89%): ${net_amount} VND`);

        // Create Payout record
        const payout = await db.Payout.create({
            provider_id: provider_id,
            transaction_id: txn.id,
            amount: amount,
            platform_fee: platform_fee,
            payment_fee: payment_fee,
            net_amount: net_amount,
            payout_status_code: 'PO1', // PENDING
            created_at: new Date()
        }, { transaction: dbTransaction });

        return payout;

    } catch (error) {
        console.error('❌ createPayoutForProvider error:', error);
        throw error;
    }
};

//  GRANT DATASET ACCESS 
const grantDatasetAccess = async (txn, dbTransaction) => {
    try {
        const { consumer_id, data_source_id, type_code } = txn;

        // If Subscription (Premium) → Create Subscription
        if (type_code === 'T2') {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 1); // 1 month

            const subscription = await db.Subscription.create({
                consumer_id,
                data_source_id,
                start_date: startDate,
                end_date: endDate,
                status_code: 'SUB1' // Active
            }, { transaction: dbTransaction });

            console.log('📅 Subscription created until:', endDate);
            return subscription;
        }

        // If Download (Basic/Standard) → No subscription needed
        console.log('✅ Download access granted');
        return { message: 'Download access granted' };

    } catch (error) {
        console.error('❌ grantDatasetAccess error:', error);
        throw error;
    }
};

//  CREATE NOTIFICATIONS 
const createNotifications = async (txn, dbTransaction) => {
    try {
        // Notification for Consumer
        await db.Notification.create({
            user_id: txn.consumer_id,
            message: `Thanh toán thành công cho dataset "${txn.dataset.title}". Bạn có thể tải xuống ngay!`,
            is_read: false,
            created_at: new Date()
        }, { transaction: dbTransaction });

        // Notification for Provider
        await db.Notification.create({
            user_id: txn.dataset.provider_id,
            message: `Dataset "${txn.dataset.title}" của bạn đã được mua. Doanh thu: ${txn.amount} VND`,
            is_read: false,
            created_at: new Date()
        }, { transaction: dbTransaction });

        console.log('📬 Notifications sent');

    } catch (error) {
        console.error('⚠️ createNotifications error:', error);
        // Don't throw - notification failure shouldn't stop transaction
    }
};

//  CHECK DOWNLOAD PERMISSION 
const checkDownloadPermission = async (consumerId, datasetId) => {
    try {
        console.log('🔍 Checking download permission...');

        // 1. Check active Premium subscription
        const activeSubscription = await db.Subscription.findOne({
            where: {
                consumer_id: consumerId,
                data_source_id: datasetId,
                status_code: 'SUB1',
                end_date: { [Sequelize.Op.gte]: new Date() }
            }
        });

        if (activeSubscription) {
            console.log('✅ Active Premium subscription - Unlimited downloads');
            return {
                allowed: true,
                type: 'PREMIUM',
                downloadLimit: Infinity,
                downloadCount: 0,
                message: 'Premium – Tải không giới hạn'
            };
        }

        // 2. Get all completed download transactions
        const transactions = await db.Transaction.findAll({
            where: {
                consumer_id: consumerId,
                data_source_id: datasetId,
                type_code: 'T1',
                payment_status_code: 'P2'
            }
        });

        if (!transactions || transactions.length === 0) {
            console.log('❌ No purchase found');
            return {
                allowed: false,
                message: 'Bạn chưa mua dataset này'
            };
        }

        // 3. Count downloads
        const downloadCount = await db.AuditLog.count({
            where: {
                user_id: consumerId,
                data_source_id: datasetId,
                action_type_code: 'DOWNLOAD'
            }
        });

        // 4. Calculate total download limit
        const dataset = await db.Dataset.findByPk(datasetId);
        let downloadLimit = 0;
        let highestPackage = 'BASIC';

        transactions.forEach(tx => {
            const amount = parseFloat(tx.amount);
            if (Math.abs(amount - parseFloat(dataset.basicPrice)) < 0.01) {
                downloadLimit += 1; // Basic: 1 download
            } else if (Math.abs(amount - parseFloat(dataset.standardPrice)) < 0.01) {
                downloadLimit += 10; // Standard: 10 downloads
                highestPackage = 'STANDARD';
            }
        });

        if (downloadCount >= downloadLimit) {
            console.log('❌ Download limit reached');
            return {
                allowed: false,
                type: highestPackage,
                downloadCount,
                downloadLimit,
                message: `Bạn đã hết lượt download (${downloadCount}/${downloadLimit})`
            };
        }

        console.log('✅ Permission granted');
        return {
            allowed: true,
            type: highestPackage,
            downloadCount,
            downloadLimit,
            message: `Còn ${downloadLimit - downloadCount} lượt download`
        };

    } catch (error) {
        console.error('❌ checkDownloadPermission error:', error);
        throw error;
    }
};

//  LOG DOWNLOAD 
const logDownload = async (userId, datasetId, ipAddress = null) => {
    try {
        await db.AuditLog.create({
            user_id: userId,
            data_source_id: datasetId,
            action_type_code: 'DOWNLOAD',
            ip_address: ipAddress
        });
        console.log('✅ Download logged');
    } catch (error) {
        console.error('⚠️ logDownload error:', error);
    }
};

//  GET USER PURCHASES 
const getUserPurchases = async (consumerId) => {
    try {
        const purchases = await db.Transaction.findAll({
            where: {
                consumer_id: consumerId,
                payment_status_code: 'P2'
            },
            include: [
                {
                    model: db.Dataset,
                    as: 'dataset',
                    attributes: ['id', 'title', 'description', 'basicPrice', 'standardPrice', 'premiumPrice'],
                    include: [{
                        model: db.Allcode,
                        as: 'category',
                        attributes: ['valueVi']
                    }]
                },
                {
                    model: db.Allcode,
                    as: 'type',
                    attributes: ['valueVi']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        return purchases;
    } catch (error) {
        console.error('❌ getUserPurchases error:', error);
        throw error;
    }
};

//  GET USER TRANSACTIONS 
const getUserTransactions = async (consumerId, filters = {}) => {
    try {
        const { limit = 20, offset = 0 } = filters;

        const transactions = await db.Transaction.findAndCountAll({
            where: { consumer_id: consumerId },
            include: [
                {
                    model: db.Dataset,
                    as: 'dataset',
                    attributes: ['title', 'category_code']
                },
                {
                    model: db.Allcode,
                    as: 'payment_status',
                    attributes: ['valueVi', 'valueEn']
                }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        return {
            errCode: 0,
            message: 'Lấy danh sách giao dịch thành công',
            data: transactions.rows,
            total: transactions.count
        };

    } catch (error) {
        console.error('❌ getUserTransactions error:', error);
        throw error;
    }
};

module.exports = {
    createTransaction,
    processPaymentCallback,
    checkDownloadPermission,
    logDownload,
    getUserPurchases,
    getUserTransactions
};