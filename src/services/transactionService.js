const db = require("../models");

//  CREATE TRANSACTION (Purchase Dataset) 
const purchaseDataset = async (consumerId, datasetId, packageType, paymentMethod) => {
    const transaction = await db.sequelize.transaction();

    try {
        console.log(' PURCHASE START ');
        console.log('Consumer:', consumerId);
        console.log('Dataset:', datasetId);
        console.log('Package:', packageType);
        console.log('Payment:', paymentMethod);

        // 1. Lấy thông tin dataset
        const dataset = await db.Dataset.findByPk(datasetId, {
            include: [{
                model: db.User,
                as: 'provider',
                attributes: ['id']
            }]
        });

        if (!dataset) {
            console.log('❌ Dataset not found');
            await transaction.rollback();
            return { errCode: 1, errMessage: "Dataset không tồn tại" };
        }

        if (dataset.status_code !== 'APPROVED') {
            console.log('❌ Dataset not approved');
            await transaction.rollback();
            return { errCode: 2, errMessage: "Dataset chưa được duyệt" };
        }

        // 2. Xác định giá và loại giao dịch
        let amount, typeCode;

        if (packageType === 'BASIC') {
            amount = dataset.basicPrice;
            typeCode = 'T1'; // Download
        } else if (packageType === 'STANDARD') {
            amount = dataset.standardPrice;
            typeCode = 'T1'; // Download
        } else if (packageType === 'PREMIUM') {
            amount = dataset.premiumPrice;
            typeCode = 'T2'; // Subscription
        } else {
            console.log('❌ Invalid package type');
            await transaction.rollback();
            return { errCode: 3, errMessage: "Package không hợp lệ" };
        }

        console.log('Amount:', amount);
        console.log('Type code:', typeCode);

        // 3. Nếu là Premium, kiểm tra subscription active
        if (packageType === 'PREMIUM') {
            const existingSubscription = await db.Subscription.findOne({
                where: {
                    consumer_id: consumerId,
                    data_source_id: datasetId,
                    status_code: 'ACTIVE',
                    end_date: { [db.Sequelize.Op.gte]: new Date() }
                }
            });

            if (existingSubscription) {
                console.log('❌ Premium subscription already active');
                await transaction.rollback();
                return { errCode: 4, errMessage: "Bạn đã có gói Premium active" };
            }
        }

        // 4. Tạo transaction (cho phép mua lại Basic/Standard nhiều lần)
        const newTransaction = await db.Transaction.create({
            consumer_id: consumerId,
            data_source_id: datasetId,
            type_code: typeCode,
            amount: amount,
            payment_status_code: 'P2', // Completed
            payment_method: paymentMethod,
            package_type: packageType
        }, { transaction });

        console.log('✅ Transaction created:', newTransaction.id);

        // 5. Nếu là Premium, tạo subscription
        if (packageType === 'PREMIUM') {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 1); // 1 tháng

            await db.Subscription.create({
                consumer_id: consumerId,
                data_source_id: datasetId,
                start_date: startDate,
                end_date: endDate,
                status_code: 'ACTIVE'
            }, { transaction });

            console.log('✅ Subscription created');
        }

        await transaction.commit();
        console.log(' PURCHASE SUCCESS ');

        return {
            errCode: 0,
            errMessage: "Mua thành công",
            transaction: newTransaction,
            packageType: packageType
        };

    } catch (error) {
        await transaction.rollback();
        console.error(' PURCHASE ERROR ');
        console.error('Error:', error);
        throw error;
    }
};

//  CHECK PURCHASE PERMISSION 
const checkDownloadPermission = async (consumerId, datasetId) => {
    try {
        console.log(' CHECK PERMISSION SERVICE ');
        console.log('Consumer:', consumerId);
        console.log('Dataset:', datasetId);

        // 1. PREMIUM – Subscription active → unlimited
        const activeSubscription = await db.Subscription.findOne({
            where: {
                consumer_id: consumerId,
                data_source_id: datasetId,
                status_code: 'ACTIVE',
                end_date: { [db.Sequelize.Op.gte]: new Date() }
            }
        });

        if (activeSubscription) {
            console.log('✅ Active subscription found - Unlimited downloads');
            return {
                allowed: true,
                type: 'PREMIUM',
                downloadLimit: Infinity,
                downloadCount: 0,
                message: 'Premium – Tải không giới hạn'
            };
        }

        // 2. Lấy tất cả transaction download (BASIC / STANDARD)
        const transactions = await db.Transaction.findAll({
            where: {
                consumer_id: consumerId,
                data_source_id: datasetId,
                type_code: 'T1', // Download
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

        // 3. Đếm số lần download đã log
        const downloadCount = await db.AuditLog.count({
            where: {
                user_id: consumerId,
                data_source_id: datasetId,
                action_type_code: 'DOWNLOAD'
            }
        });

        console.log('Download count:', downloadCount);

        // 4. Lấy dataset để xác định gói đã mua
        const dataset = await db.Dataset.findByPk(datasetId);

        let downloadLimit = 0;
        let highestPackage = 'BASIC'; // mặc định

        transactions.forEach(tx => {
            if (tx.amount === dataset.basicPrice) {
                downloadLimit += 1; // Basic
            } else if (tx.amount === dataset.standardPrice) {
                downloadLimit += 10; // Standard
                highestPackage = 'STANDARD';
            }
        });

        console.log('Total download limit:', downloadLimit);

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
        console.error('Check permission error:', error);
        throw error;
    }
};



//  LOG DOWNLOAD 
const logDownload = async (userId, datasetId, ipAddress = null) => {
    try {
        console.log(' LOG DOWNLOAD ');
        console.log('User:', userId);
        console.log('Dataset:', datasetId);
        console.log('IP:', ipAddress);

        await db.AuditLog.create({
            user_id: userId,
            data_source_id: datasetId,
            action_type_code: 'DOWNLOAD',
            ip_address: ipAddress
        });

        console.log('✅ Download logged');
    } catch (error) {
        console.error('Log download error:', error);
        // Don't throw - logging failure shouldn't stop download
    }
};

//  GET USER PURCHASES 
const getUserPurchases = async (consumerId) => {
    try {
        const purchases = await db.Transaction.findAll({
            where: {
                consumer_id: consumerId,
                payment_status_code: 'P2' // Completed
            },
            include: [
                {
                    model: db.Dataset,
                    as: 'dataset',
                    attributes: ['id', 'title', 'description'],
                    include: [
                        {
                            model: db.Allcode,
                            as: 'category',
                            attributes: ['valueVi']
                        }
                    ]
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
        console.error('Get purchases error:', error);
        throw error;
    }
};

//  CREATE TRANSACTION (OLD - Keep for compatibility) 
const createTransaction = async (data) => {
    return await db.Transaction.create(data);
};

//  PROVIDER REVENUE 
const getProviderRevenue = async (providerId) => {
    const transactions = await db.Transaction.findAll({
        where: { provider_id: providerId, payment_status_code: 'P2' }
    });

    const total = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    return total;
};

module.exports = {
    createTransaction,
    getProviderRevenue,
    purchaseDataset,
    checkDownloadPermission,
    logDownload,
    getUserPurchases
};