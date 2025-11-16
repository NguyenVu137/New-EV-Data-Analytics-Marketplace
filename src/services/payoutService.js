const db = require('../models');
const { Sequelize } = require('sequelize');

//  GET PROVIDER PAYOUTS 
const getProviderPayouts = async (providerId, filters = {}) => {
    try {
        const { status, limit = 50, offset = 0 } = filters;

        const whereClause = { provider_id: providerId };
        if (status) {
            whereClause.payout_status_code = status;
        }

        const payouts = await db.Payout.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: db.Transaction,
                    as: 'transaction',
                    include: [
                        {
                            model: db.Dataset,
                            as: 'dataset',
                            attributes: ['title', 'category_code']
                        },
                        {
                            model: db.User,
                            as: 'consumer',
                            attributes: ['email', 'firstName', 'lastName']
                        }
                    ]
                },
                {
                    model: db.Allcode,
                    as: 'payout_status',
                    attributes: ['valueVi', 'valueEn']
                }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        return {
            errCode: 0,
            message: 'Lấy danh sách payout thành công',
            data: payouts.rows,
            total: payouts.count
        };

    } catch (error) {
        console.error('❌ getProviderPayouts error:', error);
        throw error;
    }
};

//  GET PROVIDER BALANCE 
const getProviderBalance = async (providerId) => {
    try {
        // Total completed withdrawals
        const completed = await db.Payout.findOne({
            where: {
                provider_id: providerId,
                payout_status_code: 'PO3' // COMPLETED
            },
            attributes: [[Sequelize.fn('SUM', Sequelize.col('net_amount')), 'total']],
            raw: true
        });

        // Total pending + processing
        const pending = await db.Payout.findOne({
            where: {
                provider_id: providerId,
                payout_status_code: ['PO1', 'PO2'] // PENDING + PROCESSING
            },
            attributes: [[Sequelize.fn('SUM', Sequelize.col('net_amount')), 'total']],
            raw: true
        });

        // Available for withdrawal (only PO1 - PENDING)
        const available = await db.Payout.findOne({
            where: {
                provider_id: providerId,
                payout_status_code: 'PO1' // PENDING
            },
            attributes: [[Sequelize.fn('SUM', Sequelize.col('net_amount')), 'total']],
            raw: true
        });

        const availableAmount = parseFloat(available?.total || 0);
        const pendingAmount = parseFloat(pending?.total || 0);
        const completedAmount = parseFloat(completed?.total || 0);

        return {
            errCode: 0,
            message: 'Lấy số dư thành công',
            data: {
                available: availableAmount,      // Có thể rút
                pending: pendingAmount,           // Đang xử lý
                completed: completedAmount,       // Đã nhận
                total: availableAmount + pendingAmount + completedAmount
            }
        };

    } catch (error) {
        console.error('❌ getProviderBalance error:', error);
        throw error;
    }
};

//  REQUEST WITHDRAWAL 
const requestWithdrawal = async (providerId, payoutIds, bankInfo) => {
    const transaction = await db.sequelize.transaction();

    try {
        console.log('💸 Withdrawal request from provider:', providerId);

        // 1. Validate payouts
        const payouts = await db.Payout.findAll({
            where: {
                id: payoutIds,
                provider_id: providerId,
                payout_status_code: 'PO1' // Only PENDING payouts can be withdrawn
            }
        });

        if (payouts.length === 0) {
            throw new Error('Không có payout nào hợp lệ để rút');
        }

        if (payouts.length !== payoutIds.length) {
            throw new Error('Một số payout không hợp lệ hoặc đã được xử lý');
        }

        const totalAmount = payouts.reduce((sum, p) => sum + parseFloat(p.net_amount), 0);

        // 2. Update status to PROCESSING
        await db.Payout.update({
            payout_status_code: 'PO2', // PROCESSING
            bank_account: bankInfo.account_number,
            bank_name: bankInfo.bank_name,
            note: bankInfo.note || null
        }, {
            where: { id: payoutIds },
            transaction
        });

        // 3. Create notification for provider
        await db.Notification.create({
            user_id: providerId,
            message: `Yêu cầu rút ${totalAmount.toFixed(2)} VND đã được gửi. Admin sẽ xử lý trong 1-3 ngày làm việc.`,
            is_read: false,
            created_at: new Date()
        }, { transaction });

        await transaction.commit();

        console.log(`✅ Withdrawal request: ${totalAmount} VND`);

        return {
            errCode: 0,
            message: 'Yêu cầu rút tiền thành công',
            data: {
                totalAmount: totalAmount.toFixed(2),
                payoutCount: payouts.length,
                status: 'Processing (chờ Admin duyệt)'
            }
        };

    } catch (error) {
        await transaction.rollback();
        console.error('❌ requestWithdrawal error:', error);
        throw error;
    }
};

//  ADMIN: PROCESS PAYOUT 
const processPayoutByAdmin = async (payoutId, action, note) => {
    const transaction = await db.sequelize.transaction();

    try {
        console.log(`🔐 Admin ${action} payout:`, payoutId);

        const payout = await db.Payout.findByPk(payoutId, {
            include: [
                {
                    model: db.User,
                    as: 'provider',
                    attributes: ['id', 'email', 'firstName', 'lastName']
                },
                {
                    model: db.Transaction,
                    as: 'transaction',
                    include: [{ model: db.Dataset, as: 'dataset' }]
                }
            ]
        });

        if (!payout) {
            throw new Error('Payout không tồn tại');
        }

        if (payout.payout_status_code !== 'PO1' && payout.payout_status_code !== 'PO2') {
            throw new Error('Chỉ có thể xử lý payout ở trạng thái Pending (PO1) hoặc Processing (PO2)');
        }

        // Approve → PO3, Reject → PO4
        const newStatus = action === 'approve' ? 'PO3' : 'PO4';

        await payout.update({
            payout_status_code: newStatus,
            processed_at: new Date(),
            note: note || payout.note
        }, { transaction });

        // Send notification to Provider
        const message = action === 'approve'
            ? `Yêu cầu rút ${payout.net_amount} VND đã được duyệt và chuyển khoản thành công vào tài khoản ${payout.bank_account} - ${payout.bank_name}`
            : `Yêu cầu rút ${payout.net_amount} VND bị từ chối. Lý do: ${note || 'Không rõ'}`;

        await db.Notification.create({
            user_id: payout.provider_id,
            message: message,
            is_read: false,
            created_at: new Date()
        }, { transaction });

        await transaction.commit();

        console.log(`✅ Payout ${action}d`);

        return {
            errCode: 0,
            message: `Payout đã ${action === 'approve' ? 'được duyệt' : 'bị từ chối'}`,
            payout
        };

    } catch (error) {
        await transaction.rollback();
        console.error('❌ processPayoutByAdmin error:', error);
        throw error;
    }
};

//  ADMIN: GET PENDING PAYOUTS 
const getPendingPayouts = async (filters = {}) => {
    try {
        const { limit = 50, offset = 0 } = filters;

        const payouts = await db.Payout.findAndCountAll({
            where: { payout_status_code: 'PO2' }, // PROCESSING
            include: [
                {
                    model: db.User,
                    as: 'provider',
                    attributes: ['id', 'email', 'firstName', 'lastName']
                },
                {
                    model: db.Transaction,
                    as: 'transaction',
                    include: [
                        { model: db.Dataset, as: 'dataset', attributes: ['title'] }
                    ]
                },
                {
                    model: db.Allcode,
                    as: 'payout_status',
                    attributes: ['valueVi', 'valueEn']
                }
            ],
            order: [['created_at', 'ASC']], // Oldest first
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        return {
            errCode: 0,
            message: 'Lấy danh sách payout thành công',
            data: payouts.rows,
            total: payouts.count
        };

    } catch (error) {
        console.error('❌ getPendingPayouts error:', error);
        throw error;
    }
};

//  ADMIN: GET PAYOUT STATISTICS 
const getPayoutStatistics = async () => {
    try {
        // Statistics by status
        const stats = await db.sequelize.query(`
            SELECT 
                p.payout_status_code,
                ac.valueVi as status_name,
                COUNT(*) as count,
                COALESCE(SUM(p.net_amount), 0) as total_amount
            FROM payouts p
            LEFT JOIN allcodes ac 
                ON p.payout_status_code = ac.key 
                AND ac.type = 'PAYOUT_STATUS'
            GROUP BY p.payout_status_code, ac.valueVi
        `, { type: db.Sequelize.QueryTypes.SELECT });

        // Total statistics
        const totalPayout = await db.Payout.findOne({
            attributes: [
                [db.Sequelize.fn('SUM', db.Sequelize.col('net_amount')), 'total'],
                [db.Sequelize.fn('SUM', db.Sequelize.col('platform_fee')), 'total_platform_fee'],
                [db.Sequelize.fn('SUM', db.Sequelize.col('payment_fee')), 'total_payment_fee']
            ],
            raw: true
        });

        return {
            errCode: 0,
            message: 'Lấy thống kê thành công',
            data: {
                byStatus: stats,
                totals: {
                    payout: parseFloat(totalPayout.total || 0),
                    platformFee: parseFloat(totalPayout.total_platform_fee || 0),
                    paymentFee: parseFloat(totalPayout.total_payment_fee || 0)
                }
            }
        };

    } catch (error) {
        console.error('❌ getPayoutStatistics error:', error);
        throw error;
    }
};

module.exports = {
    getProviderPayouts,
    getProviderBalance,
    requestWithdrawal,
    processPayoutByAdmin,
    getPendingPayouts,
    getPayoutStatistics
};