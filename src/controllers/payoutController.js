const payoutService = require('../services/payoutService')
const db = require('../models')

// GET MY PAYOUTS
const getMyPayouts = async (req, res) => {
    try {
        const provider_id = req.user.id
        const { status, limit = 50, offset = 0 } = req.query

        const result = await payoutService.getProviderPayouts(provider_id, {
            status,
            limit: parseInt(limit),
            offset: parseInt(offset)
        })

        return res.status(200).json(result)

    } catch (error) {
        console.error('Get payouts error:', error)
        return res.status(500).json({
            errCode: -1,
            message: 'Lỗi khi lấy danh sách payout',
            error: error.message
        })
    }
}

// GET PROVIDER BALANCE
const getBalance = async (req, res) => {
    try {
        const provider_id = req.user.id
        const result = await payoutService.getProviderBalance(provider_id)

        return res.status(200).json(result)

    } catch (error) {
        console.error('Get balance error:', error)
        return res.status(500).json({
            errCode: -1,
            message: 'Lỗi khi lấy số dư',
            error: error.message
        })
    }
}

// REQUEST WITHDRAW
const requestWithdraw = async (req, res) => {
    try {
        const provider_id = req.user.id
        const { payout_ids, bank_info } = req.body

        if (!payout_ids || !Array.isArray(payout_ids) || payout_ids.length === 0) {
            return res.status(400).json({
                errCode: 1,
                message: 'Danh sách payout không hợp lệ'
            })
        }

        if (!bank_info || !bank_info.account_number || !bank_info.bank_name) {
            return res.status(400).json({
                errCode: 1,
                message: 'Thông tin ngân hàng không đầy đủ'
            })
        }

        const result = await payoutService.requestWithdrawal(
            provider_id,
            payout_ids,
            bank_info
        )

        return res.status(200).json(result)

    } catch (error) {
        console.error('Request withdraw error:', error)
        return res.status(500).json({
            errCode: -1,
            message: 'Lỗi khi yêu cầu rút tiền',
            error: error.message
        })
    }
}

// ADMIN PROCESS PAYOUT
const processPayout = async (req, res) => {
    try {
        const { payoutId } = req.params
        const { action, note } = req.body

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({
                errCode: 1,
                message: 'Action không hợp lệ'
            })
        }

        const result = await payoutService.processPayoutByAdmin(payoutId, action, note)

        return res.status(200).json(result)

    } catch (error) {
        console.error('Process payout error:', error)
        return res.status(200).json({
            errCode: -1,
            message: error.message || 'Lỗi khi xử lý payout'
        })
    }
}

// ADMIN GET PENDING PAYOUTS
const getPendingPayouts = async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query

        const payouts = await db.Payout.findAndCountAll({
            where: { payout_status_code: 'PO2' },
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
                { model: db.Allcode, as: 'payout_status', attributes: ['valueVi', 'valueEn'] }
            ],
            order: [['created_at', 'ASC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        })

        return res.status(200).json({
            errCode: 0,
            message: 'Lấy danh sách payout thành công',
            data: payouts.rows,
            total: payouts.count
        })

    } catch (error) {
        console.error('Get pending payouts error:', error)
        return res.status(500).json({
            errCode: -1,
            message: 'Lỗi khi lấy danh sách payout',
            error: error.message
        })
    }
}

// ADMIN GET ALL PAYOUTS (WITH FILTER)
const getAllPayouts = async (req, res) => {
    try {
        const { status, limit = 50, offset = 0 } = req.query

        const whereClause = {}
        if (status) {
            whereClause.payout_status_code = status
        }

        const payouts = await db.Payout.findAndCountAll({
            where: whereClause,
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
                { model: db.Allcode, as: 'payout_status', attributes: ['valueVi', 'valueEn'] }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        })

        return res.status(200).json({
            errCode: 0,
            message: 'Lấy danh sách payout thành công',
            data: payouts.rows,
            total: payouts.count
        })

    } catch (error) {
        console.error('Get all payouts error:', error)
        return res.status(500).json({
            errCode: -1,
            message: 'Lỗi khi lấy danh sách payout',
            error: error.message
        })
    }
}

// ADMIN STATISTICS
const getPayoutStatistics = async (req, res) => {
    try {
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
        `, { type: db.Sequelize.QueryTypes.SELECT })

        const totalPayout = await db.Payout.findOne({
            attributes: [
                [db.Sequelize.fn('SUM', db.Sequelize.col('net_amount')), 'total'],
                [db.Sequelize.fn('SUM', db.Sequelize.col('platform_fee')), 'total_platform_fee'],
                [db.Sequelize.fn('SUM', db.Sequelize.col('payment_fee')), 'total_payment_fee']
            ],
            raw: true
        })

        return res.status(200).json({
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
        })

    } catch (error) {
        console.error('Get payout statistics error:', error)
        return res.status(500).json({
            errCode: -1,
            message: 'Lỗi khi lấy thống kê',
            error: error.message
        })
    }
}

module.exports = {
    getMyPayouts,
    getBalance,
    requestWithdraw,
    processPayout,
    getPendingPayouts,
    getAllPayouts,
    getPayoutStatistics
}
