// // import express from 'express';
// // const { Op } = require('sequelize');
// // const Transaction = require('../models/Transaction');
// // const Payout = require('../models/Payout');
// // const { auth } = require('../../shared/middleware/auth');
// // const { checkRole } = require('../../shared/middleware/checkRole');
// // const ServiceClient = require('../../shared/utils/serviceClient');
// // const upload = require('../config/multerConfig');

// // const router = express.Router();
// // const datasetService = new ServiceClient(process.env.DATASET_SERVICE_URL || 'http://dataset-service:8082', 'Dataset');

// // // Create transaction
// // router.post('/', auth, async (req, res) => {
// //     try {
// //         const { datasetId, packageType, paymentMethod } = req.body;

// //         const dataset = await datasetService.get(`/api/datasets/${datasetId}`);

// //         if (!dataset || dataset.errCode !== 0) {
// //             return res.status(404).json({
// //                 errCode: 1,
// //                 message: 'Dataset not found'
// //             });
// //         }

// //         const priceField = {
// //             'BASIC': 'basicPrice',
// //             'STANDARD': 'standardPrice',
// //             'PREMIUM': 'premiumPrice'
// //         }[packageType.toUpperCase()];

// //         const amount = dataset.data[priceField];

// //         const transaction = await Transaction.create({
// //             consumer_id: req.user.id,
// //             data_source_id: datasetId,
// //             type_code: packageType === 'PREMIUM' ? 'T2' : 'T1',
// //             amount,
// //             payment_status_code: 'P1',
// //             payment_method: paymentMethod
// //         });

// //         // Auto-complete payment for demo
// //         setTimeout(async () => {
// //             try {
// //                 await Transaction.update(
// //                     { payment_status_code: 'P2' },
// //                     { where: { id: transaction.id } }
// //                 );
// //                 console.log('✅ Payment auto-completed:', transaction.id);

// //                 // Tạo payout với status PENDING (chờ admin duyệt)
// //                 const provider_id = dataset.data.provider_id;
// //                 if (provider_id) {
// //                     await Payout.create({
// //                         provider_id,
// //                         amount,
// //                         status: 'PENDING', // Chờ admin duyệt
// //                         note: `Payout for transaction ${transaction.id}`,
// //                         request_date: new Date()
// //                     });
// //                     console.log('✅ Payout created for provider:', provider_id);
// //                 }
// //             } catch (error) {
// //                 console.error('❌ Auto-complete or payout failed:', error);
// //             }
// //         }, 1000);

// //         res.status(201).json({
// //             errCode: 0,
// //             message: 'Transaction created successfully',
// //             transaction: {
// //                 id: transaction.id,
// //                 amount: transaction.amount
// //             }
// //         });
// //     } catch (error) {
// //         console.error('Create transaction error:', error);
// //         res.status(500).json({
// //             errCode: -1,
// //             message: 'Failed to create transaction',
// //             error: error.message
// //         });
// //     }
// // });

// // // Get user transactions
// // router.get('/my-transactions', auth, async (req, res) => {
// //     try {
// //         const transactions = await Transaction.findAll({
// //             where: { consumer_id: req.user.id },
// //             order: [['created_at', 'DESC']]
// //         });

// //         res.json({
// //             errCode: 0,
// //             data: transactions
// //         });
// //     } catch (error) {
// //         res.status(500).json({
// //             errCode: -1,
// //             message: 'Failed to get transactions'
// //         });
// //     }
// // });

// // // Check download permission
// // router.get('/check-permission/:datasetId', auth, async (req, res) => {
// //     try {
// //         const purchase = await Transaction.findOne({
// //             where: {
// //                 consumer_id: req.user.id,
// //                 data_source_id: req.params.datasetId,
// //                 payment_status_code: 'P2'
// //             }
// //         });

// //         res.json({
// //             errCode: 0,
// //             allowed: !!purchase,
// //             message: purchase ? 'Access granted' : 'Purchase required'
// //         });
// //     } catch (error) {
// //         res.status(500).json({
// //             errCode: -1,
// //             message: 'Failed to check permission'
// //         });
// //     }
// // });

// // // Payment callback (from gateway)
// // router.post('/callback', async (req, res) => {
// //     try {
// //         const { transactionId, status, paymentId } = req.body;

// //         const transaction = await Transaction.findByPk(transactionId);
// //         if (!transaction) {
// //             return res.status(404).json({
// //                 errCode: 1,
// //                 message: 'Transaction not found'
// //             });
// //         }

// //         await transaction.update({
// //             payment_status_code: status === 'success' ? 'P2' : 'P3',
// //             payment_id: paymentId
// //         });

// //         res.json({
// //             errCode: 0,
// //             message: 'Payment callback processed'
// //         });
// //     } catch (error) {
// //         res.status(500).json({
// //             errCode: -1,
// //             message: 'Failed to process callback'
// //         });
// //     }
// // });

// // // Simulate payment (dev mode)
// // router.post('/simulate/:transactionId', auth, async (req, res) => {
// //     try {
// //         const transaction = await Transaction.findByPk(req.params.transactionId);

// //         if (!transaction) {
// //             return res.status(404).json({
// //                 errCode: 1,
// //                 message: 'Transaction not found'
// //             });
// //         }

// //         await transaction.update({
// //             payment_status_code: 'P2'
// //         });

// //         res.json({
// //             errCode: 0,
// //             message: 'Payment simulated successfully'
// //         });
// //     } catch (error) {
// //         res.status(500).json({
// //             errCode: -1,
// //             message: 'Failed to simulate payment'
// //         });
// //     }
// // });

// // // ========== PAYOUT ROUTES ==========

// // // Get provider balance
// // router.get('/balance', auth, checkRole(['R2']), async (req, res) => {
// //     try {
// //         // Tổng tất cả (trừ REJECTED)
// //         const total = await Payout.sum('amount', {
// //             where: {
// //                 provider_id: req.user.id,
// //                 status: { [Op.ne]: 'REJECTED' }
// //             }
// //         }) || 0;

// //         // Có thể rút = APPROVED
// //         const available = await Payout.sum('amount', {
// //             where: {
// //                 provider_id: req.user.id,
// //                 status: 'APPROVED'
// //             }
// //         }) || 0;

// //         // Đang chờ admin duyệt = PENDING
// //         const pending = await Payout.sum('amount', {
// //             where: {
// //                 provider_id: req.user.id,
// //                 status: 'PENDING'
// //             }
// //         }) || 0;

// //         // Đã rút (chưa có logic này)
// //         const completed = 0;

// //         res.json({
// //             errCode: 0,
// //             data: {
// //                 total,
// //                 available,
// //                 pending,
// //                 completed
// //             }
// //         });
// //     } catch (error) {
// //         console.error('Get balance error:', error);
// //         res.status(500).json({
// //             errCode: -1,
// //             message: 'Failed to get balance'
// //         });
// //     }
// // });

// // // Get my payouts - Trả về đúng status text
// // router.get('/my-payouts', auth, checkRole(['R2']), async (req, res) => {
// //     try {
// //         const { limit = 50, offset = 0, status } = req.query;

// //         const where = { provider_id: req.user.id };

// //         // Filter theo status nếu có
// //         if (status && status !== 'all') {
// //             // Map frontend status sang DB status
// //             const statusMap = {
// //                 'pending': 'PENDING',
// //                 'available': 'APPROVED',
// //                 'failed': 'REJECTED'
// //             };

// //             const dbStatus = statusMap[status.toLowerCase()];
// //             if (dbStatus) {
// //                 where.status = dbStatus;
// //             }
// //         }

// //         const payouts = await Payout.findAll({
// //             where,
// //             limit: parseInt(limit),
// //             offset: parseInt(offset),
// //             order: [['created_at', 'DESC']]
// //         });

// //         // Map DB status về frontend status
// //         const mappedPayouts = payouts.map(payout => {
// //             const data = payout.toJSON();

// //             // Map status
// //             const statusMap = {
// //                 'PENDING': 'pending',
// //                 'APPROVED': 'available',
// //                 'REJECTED': 'failed',
// //                 'PROCESSING': 'processing',
// //                 'COMPLETED': 'completed'
// //             };

// //             return {
// //                 ...data,
// //                 status: statusMap[data.status] || data.status.toLowerCase()
// //             };
// //         });

// //         res.json({
// //             errCode: 0,
// //             data: mappedPayouts
// //         });
// //     } catch (error) {
// //         console.error('Get my payouts error:', error);
// //         res.status(500).json({
// //             errCode: -1,
// //             message: 'Failed to get payouts'
// //         });
// //     }
// // });

// // // THÊM MỚI: Get withdrawal history (lịch sử rút tiền)
// // router.get('/withdrawal-history', auth, checkRole(['R2']), async (req, res) => {
// //     try {
// //         const { limit = 50, offset = 0 } = req.query;

// //         // Lấy các payout đã rút (PROCESSING, COMPLETED)
// //         const withdrawals = await Payout.findAll({
// //             where: {
// //                 provider_id: req.user.id,
// //                 status: { [Op.in]: ['PROCESSING', 'COMPLETED'] },
// //                 bank_name: { [Op.ne]: null } // Đã có thông tin ngân hàng
// //             },
// //             limit: parseInt(limit),
// //             offset: parseInt(offset),
// //             order: [['request_date', 'DESC']]
// //         });

// //         // Group theo lần rút (cùng ngày + cùng bank info = 1 lần rút)
// //         const groupedWithdrawals = [];
// //         const seen = new Set();

// //         for (const payout of withdrawals) {
// //             const key = `${payout.bank_name}_${payout.account_number}_${payout.request_date}`;

// //             if (!seen.has(key)) {
// //                 seen.add(key);

// //                 // Tìm tất cả payout cùng lần rút
// //                 const relatedPayouts = withdrawals.filter(p => 
// //                     p.bank_name === payout.bank_name &&
// //                     p.account_number === payout.account_number &&
// //                     new Date(p.request_date).getTime() === new Date(payout.request_date).getTime()
// //                 );

// //                 const totalAmount = relatedPayouts.reduce((sum, p) => sum + parseFloat(p.amount), 0);

// //                 groupedWithdrawals.push({
// //                     id: payout.id,
// //                     withdrawal_date: payout.request_date,
// //                     total_amount: totalAmount,
// //                     payout_count: relatedPayouts.length,
// //                     bank_name: payout.bank_name,
// //                     account_number: payout.account_number,
// //                     account_holder: payout.account_holder,
// //                     status: payout.status,
// //                     note: payout.note,
// //                     payouts: relatedPayouts.map(p => ({
// //                         id: p.id,
// //                         amount: p.amount,
// //                         status: p.status
// //                     }))
// //                 });
// //             }
// //         }

// //         res.json({
// //             errCode: 0,
// //             data: groupedWithdrawals
// //         });
// //     } catch (error) {
// //         console.error('Get withdrawal history error:', error);
// //         res.status(500).json({
// //             errCode: -1,
// //             message: 'Failed to get withdrawal history'
// //         });
// //     }
// // });

// // // Request withdrawal - Provider rút những payout đã APPROVED
// // router.post('/withdraw', auth, checkRole(['R2']), async (req, res) => {
// //     try {
// //         console.log('===== WITHDRAW REQUEST =====');
// //         console.log('req.body:', req.body);
// //         console.log('req.body.payoutIds:', req.body.payoutIds);
// //         console.log('req.body.bankInfo:', req.body.bankInfo);
// //         console.log('===========================');
// //         const { payoutIds, bankInfo } = req.body;

// //         if (!payoutIds || payoutIds.length === 0) {
// //             return res.status(400).json({
// //                 errCode: 1,
// //                 message: 'No payouts selected'
// //             });
// //         }

// //         if (!bankInfo || !bankInfo.bankName || !bankInfo.accountNumber || !bankInfo.accountName) {
// //             return res.status(400).json({
// //                 errCode: 1,
// //                 message: 'Bank information is required'
// //             });
// //         }

// //         // Kiểm tra các payout có status APPROVED không
// //         const payouts = await Payout.findAll({
// //             where: {
// //                 id: { [Op.in]: payoutIds },
// //                 provider_id: req.user.id,
// //                 status: 'APPROVED' // Chỉ cho rút những payout đã được admin approve
// //             }
// //         });

// //         if (payouts.length === 0) {
// //             return res.status(400).json({
// //                 errCode: 1,
// //                 success: false,
// //                 message: 'No approved payouts found. Only approved payouts can be withdrawn.'
// //             });
// //         }

// //         if (payouts.length !== payoutIds.length) {
// //             return res.status(400).json({
// //                 errCode: 1,
// //                 success: false,
// //                 message: 'Some payouts are not approved yet'
// //             });
// //         }

// //         // Tính tổng số tiền
// //         const totalAmount = payouts.reduce((sum, p) => sum + parseFloat(p.amount), 0);

// //         // Cập nhật thông tin ngân hàng và chuyển sang PROCESSING
// //         await Payout.update(
// //             {
// //                 bank_name: bankInfo.bankName,
// //                 account_number: bankInfo.accountNumber,
// //                 account_holder: bankInfo.accountName,
// //                 status: 'PROCESSING', // Đang xử lý chuyển tiền
// //                 note: `Withdrawal requested - Total: ${totalAmount} VND`,
// //                 request_date: new Date()
// //             },
// //             {
// //                 where: {
// //                     id: { [Op.in]: payoutIds }
// //                 }
// //             }
// //         );

// //         res.status(200).json({
// //             errCode: 0,
// //             success: true,
// //             message: 'Withdrawal request submitted successfully',
// //             data: {
// //                 payoutIds,
// //                 totalAmount,
// //                 bankInfo
// //             }
// //         });
// //     } catch (error) {
// //         console.error('Request withdrawal error:', error);
// //         res.status(500).json({
// //             errCode: -1,
// //             success: false,
// //             message: 'Failed to request withdrawal'
// //         });
// //     }
// // });

// // // Admin: Get pending payouts
// // router.get('/payouts/pending', auth, checkRole(['R1']), async (req, res) => {
// //     try {
// //         const { limit = 50, offset = 0 } = req.query;

// //         const payouts = await Payout.findAll({
// //             where: { status: 'PENDING' }, // Chờ admin duyệt
// //             limit: parseInt(limit),
// //             offset: parseInt(offset),
// //             order: [['created_at', 'ASC']]
// //         });

// //         res.json({
// //             errCode: 0,
// //             data: payouts
// //         });
// //     } catch (error) {
// //         console.error('Get pending payouts error:', error);
// //         res.status(500).json({
// //             errCode: -1,
// //             message: 'Failed to get pending payouts'
// //         });
// //     }
// // });

// // // Admin: Process payout (Approve/Reject)
// // router.post('/payouts/:id/process', auth, checkRole(['R1']), async (req, res) => {
// //     try {
// //         const { action, admin_note } = req.body;

// //         const payout = await Payout.findByPk(req.params.id);
// //         if (!payout) {
// //             return res.status(404).json({
// //                 errCode: 1,
// //                 message: 'Payout not found'
// //             });
// //         }

// //         if (payout.status !== 'PENDING') {
// //             return res.status(400).json({
// //                 errCode: 1,
// //                 message: 'Only pending payouts can be processed'
// //             });
// //         }

// //         // Approve -> APPROVED (provider có thể rút)
// //         // Reject -> REJECTED (từ chối)
// //         const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';

// //         await payout.update({
// //             status: newStatus,
// //             admin_note,
// //             processed_by: req.user.id,
// //             processed_at: new Date()
// //         });

// //         res.json({
// //             errCode: 0,
// //             message: `Payout ${action}d successfully`,
// //             data: payout
// //         });
// //     } catch (error) {
// //         console.error('Process payout error:', error);
// //         res.status(500).json({
// //             errCode: -1,
// //             message: 'Failed to process payout'
// //         });
// //     }
// // });

// // // Admin: Get payout statistics
// // router.get('/payouts/statistics', auth, checkRole(['R1']), async (req, res) => {
// //     try {
// //         const totalPending = await Payout.sum('amount', {
// //             where: { status: 'PENDING' }
// //         }) || 0;

// //         const totalApproved = await Payout.sum('amount', {
// //             where: { status: { [Op.in]: ['APPROVED', 'PROCESSING', 'COMPLETED'] } }
// //         }) || 0;

// //         const totalRejected = await Payout.count({
// //             where: { status: 'REJECTED' }
// //         });

// //         res.json({
// //             errCode: 0,
// //             data: {
// //                 totalPending,
// //                 totalApproved,
// //                 totalRejected
// //             }
// //         });
// //     } catch (error) {
// //         res.status(500).json({
// //             errCode: -1,
// //             message: 'Failed to get statistics'
// //         });
// //     }
// // });

// // // Admin: Get all payouts
// // router.get('/payouts', auth, checkRole(['R1']), async (req, res) => {
// //     try {
// //         const { limit = 50, offset = 0, status } = req.query;

// //         const where = {};
// //         if (status && status !== '') where.status = status;

// //         const payouts = await Payout.findAll({
// //             where,
// //             limit: parseInt(limit),
// //             offset: parseInt(offset),
// //             order: [['created_at', 'DESC']]
// //         });

// //         res.json({
// //             errCode: 0,
// //             data: payouts
// //         });
// //     } catch (error) {
// //         res.status(500).json({
// //             errCode: -1,
// //             message: 'Failed to get payouts'
// //         });
// //     }
// // });

// // // Upload file
// // router.post('/upload', auth, upload.single('file'), async (req, res) => {
// //     try {
// //         if (!req.file) {
// //             return res.status(400).json({
// //                 errCode: 1,
// //                 message: 'No file uploaded.'
// //             });
// //         }
// //         res.status(200).json({
// //             errCode: 0,
// //             message: 'File uploaded successfully.',
// //             file: {
// //                 originalname: req.file.originalname,
// //                 filename: req.file.filename,
// //                 mimetype: req.file.mimetype,
// //                 size: req.file.size,
// //                 path: req.file.path
// //             }
// //         });
// //     } catch (error) {
// //         res.status(500).json({
// //             errCode: -1,
// //             message: 'File upload failed.',
// //             error: error.message
// //         });
// //     }
// // });

// // export default router;



// import express from 'express';
// const { Op } = require('sequelize');
// const Transaction = require('../models/Transaction');
// const Payout = require('../models/Payout');
// const { auth } = require('../../shared/middleware/auth');
// const { checkRole } = require('../../shared/middleware/checkRole');
// const ServiceClient = require('../../shared/utils/serviceClient');
// const upload = require('../config/multerConfig');

// const router = express.Router();
// const datasetService = new ServiceClient(process.env.DATASET_SERVICE_URL || 'http://dataset-service:8082', 'Dataset');

// // Create transaction
// router.post('/', auth, async (req, res) => {
//     try {
//         const { datasetId, packageType, paymentMethod } = req.body;

//         const dataset = await datasetService.get(`/api/datasets/${datasetId}`);

//         if (!dataset || dataset.errCode !== 0) {
//             return res.status(404).json({
//                 errCode: 1,
//                 message: 'Dataset not found'
//             });
//         }

//         const priceField = {
//             'BASIC': 'basicPrice',
//             'STANDARD': 'standardPrice',
//             'PREMIUM': 'premiumPrice'
//         }[packageType.toUpperCase()];

//         const amount = dataset.data[priceField];

//         const transaction = await Transaction.create({
//             consumer_id: req.user.id,
//             data_source_id: datasetId,
//             type_code: packageType === 'PREMIUM' ? 'T2' : 'T1',
//             amount,
//             payment_status_code: 'P1',
//             payment_method: paymentMethod
//         });

//         // Auto-complete payment for demo
//         setTimeout(async () => {
//             try {
//                 await Transaction.update(
//                     { payment_status_code: 'P2' },
//                     { where: { id: transaction.id } }
//                 );
//                 console.log('✅ Payment auto-completed:', transaction.id);

//                 // Tạo payout với status PENDING (chờ admin duyệt)
//                 const provider_id = dataset.data.provider_id;
//                 if (provider_id) {
//                     await Payout.create({
//                         provider_id,
//                         amount,
//                         status: 'PENDING', // Chờ admin duyệt
//                         note: `Payout for transaction ${transaction.id}`,
//                         request_date: new Date()
//                     });
//                     console.log('✅ Payout created for provider:', provider_id);
//                 }
//             } catch (error) {
//                 console.error('❌ Auto-complete or payout failed:', error);
//             }
//         }, 1000);

//         res.status(201).json({
//             errCode: 0,
//             message: 'Transaction created successfully',
//             transaction: {
//                 id: transaction.id,
//                 amount: transaction.amount
//             }
//         });
//     } catch (error) {
//         console.error('Create transaction error:', error);
//         res.status(500).json({
//             errCode: -1,
//             message: 'Failed to create transaction',
//             error: error.message
//         });
//     }
// });

// // Get user transactions
// router.get('/my-transactions', auth, async (req, res) => {
//     try {
//         const transactions = await Transaction.findAll({
//             where: { consumer_id: req.user.id },
//             order: [['created_at', 'DESC']]
//         });

//         res.json({
//             errCode: 0,
//             data: transactions
//         });
//     } catch (error) {
//         res.status(500).json({
//             errCode: -1,
//             message: 'Failed to get transactions'
//         });
//     }
// });

// // Check download permission
// router.get('/check-permission/:datasetId', auth, async (req, res) => {
//     try {
//         const purchase = await Transaction.findOne({
//             where: {
//                 consumer_id: req.user.id,
//                 data_source_id: req.params.datasetId,
//                 payment_status_code: 'P2'
//             }
//         });

//         res.json({
//             errCode: 0,
//             allowed: !!purchase,
//             message: purchase ? 'Access granted' : 'Purchase required'
//         });
//     } catch (error) {
//         res.status(500).json({
//             errCode: -1,
//             message: 'Failed to check permission'
//         });
//     }
// });

// // Payment callback (from gateway)
// router.post('/callback', async (req, res) => {
//     try {
//         const { transactionId, status, paymentId } = req.body;

//         const transaction = await Transaction.findByPk(transactionId);
//         if (!transaction) {
//             return res.status(404).json({
//                 errCode: 1,
//                 message: 'Transaction not found'
//             });
//         }

//         await transaction.update({
//             payment_status_code: status === 'success' ? 'P2' : 'P3',
//             payment_id: paymentId
//         });

//         res.json({
//             errCode: 0,
//             message: 'Payment callback processed'
//         });
//     } catch (error) {
//         res.status(500).json({
//             errCode: -1,
//             message: 'Failed to process callback'
//         });
//     }
// });

// // Simulate payment (dev mode)
// router.post('/simulate/:transactionId', auth, async (req, res) => {
//     try {
//         const transaction = await Transaction.findByPk(req.params.transactionId);

//         if (!transaction) {
//             return res.status(404).json({
//                 errCode: 1,
//                 message: 'Transaction not found'
//             });
//         }

//         await transaction.update({
//             payment_status_code: 'P2'
//         });

//         res.json({
//             errCode: 0,
//             message: 'Payment simulated successfully'
//         });
//     } catch (error) {
//         res.status(500).json({
//             errCode: -1,
//             message: 'Failed to simulate payment'
//         });
//     }
// });

// // ========== PAYOUT ROUTES ==========

// // Get provider balance
// router.get('/balance', auth, checkRole(['R2']), async (req, res) => {
//     try {
//         // Tổng tất cả (trừ REJECTED)
//         const total = await Payout.sum('amount', {
//             where: {
//                 provider_id: req.user.id,
//                 status: { [Op.ne]: 'REJECTED' }
//             }
//         }) || 0;

//         // Có thể rút = APPROVED
//         const available = await Payout.sum('amount', {
//             where: {
//                 provider_id: req.user.id,
//                 status: 'APPROVED'
//             }
//         }) || 0;

//         // Đang chờ admin duyệt = PENDING
//         const pending = await Payout.sum('amount', {
//             where: {
//                 provider_id: req.user.id,
//                 status: 'PENDING'
//             }
//         }) || 0;

//         // Đã rút = COMPLETED
//         const completed = await Payout.sum('amount', {
//             where: {
//                 provider_id: req.user.id,
//                 status: 'COMPLETED'
//             }
//         }) || 0;

//         res.json({
//             errCode: 0,
//             data: {
//                 total,
//                 available,
//                 pending,
//                 completed
//             }
//         });
//     } catch (error) {
//         console.error('Get balance error:', error);
//         res.status(500).json({
//             errCode: -1,
//             message: 'Failed to get balance'
//         });
//     }
// });

// // THÊM MỚI: Get withdrawal history (lịch sử rút tiền)
// router.get('/withdrawal-history', auth, checkRole(['R2']), async (req, res) => {
//     try {
//         const { limit = 50, offset = 0 } = req.query;

//         // Lấy các payout đã rút (COMPLETED)
//         const withdrawals = await Payout.findAll({
//             where: {
//                 provider_id: req.user.id,
//                 status: 'COMPLETED',
//                 bank_name: { [Op.ne]: null }
//             },
//             limit: parseInt(limit),
//             offset: parseInt(offset),
//             order: [['request_date', 'DESC']]
//         });

//         // Group theo lần rút (cùng ngày + cùng bank info = 1 lần rút)
//         const groupedWithdrawals = [];
//         const seen = new Set();

//         for (const payout of withdrawals) {
//             const key = `${payout.bank_name}_${payout.account_number}_${payout.request_date}`;

//             if (!seen.has(key)) {
//                 seen.add(key);

//                 const relatedPayouts = withdrawals.filter(p => 
//                     p.bank_name === payout.bank_name &&
//                     p.account_number === payout.account_number &&
//                     new Date(p.request_date).getTime() === new Date(payout.request_date).getTime()
//                 );

//                 const totalAmount = relatedPayouts.reduce((sum, p) => sum + parseFloat(p.amount), 0);

//                 groupedWithdrawals.push({
//                     id: payout.id,
//                     withdrawal_date: payout.request_date,
//                     total_amount: totalAmount,
//                     payout_count: relatedPayouts.length,
//                     bank_name: payout.bank_name,
//                     account_number: payout.account_number,
//                     account_holder: payout.account_holder,
//                     status: payout.status,
//                     note: payout.note,
//                     payouts: relatedPayouts.map(p => ({
//                         id: p.id,
//                         amount: p.amount,
//                         status: p.status
//                     }))
//                 });
//             }
//         }

//         res.json({
//             errCode: 0,
//             data: groupedWithdrawals
//         });
//     } catch (error) {
//         console.error('Get withdrawal history error:', error);
//         res.status(500).json({
//             errCode: -1,
//             message: 'Failed to get withdrawal history'
//         });
//     }
// });

// // Get my payouts - Trả về đúng status text
// router.get('/my-payouts', auth, checkRole(['R2']), async (req, res) => {
//     try {
//         const { limit = 50, offset = 0, status } = req.query;

//         const where = { provider_id: req.user.id };

//         // Filter theo status nếu có
//         if (status && status !== 'all') {
//             // Map frontend status sang DB status
//             const statusMap = {
//                 'pending': 'PENDING',
//                 'available': 'APPROVED',
//                 'failed': 'REJECTED'
//             };

//             const dbStatus = statusMap[status.toLowerCase()];
//             if (dbStatus) {
//                 where.status = dbStatus;
//             }
//         }

//         const payouts = await Payout.findAll({
//             where,
//             limit: parseInt(limit),
//             offset: parseInt(offset),
//             order: [['created_at', 'DESC']]
//         });

//         // Map DB status về frontend status
//         const mappedPayouts = payouts.map(payout => {
//             const data = payout.toJSON();

//             // Map status
//             const statusMap = {
//                 'PENDING': 'pending',
//                 'APPROVED': 'available',
//                 'REJECTED': 'failed',
//                 'PROCESSING': 'processing',
//                 'COMPLETED': 'completed'
//             };

//             return {
//                 ...data,
//                 status: statusMap[data.status] || data.status.toLowerCase()
//             };
//         });

//         res.json({
//             errCode: 0,
//             data: mappedPayouts
//         });
//     } catch (error) {
//         console.error('Get my payouts error:', error);
//         res.status(500).json({
//             errCode: -1,
//             message: 'Failed to get payouts'
//         });
//     }
// });

// // THÊM MỚI: Get withdrawal history (lịch sử rút tiền)
// router.get('/withdrawal-history', auth, checkRole(['R2']), async (req, res) => {
//     try {
//         const { limit = 50, offset = 0 } = req.query;

//         // Lấy các payout đã rút (PROCESSING, COMPLETED)
//         const withdrawals = await Payout.findAll({
//             where: {
//                 provider_id: req.user.id,
//                 status: { [Op.in]: ['PROCESSING', 'COMPLETED'] },
//                 bank_name: { [Op.ne]: null } // Đã có thông tin ngân hàng
//             },
//             limit: parseInt(limit),
//             offset: parseInt(offset),
//             order: [['request_date', 'DESC']]
//         });

//         // Group theo lần rút (cùng ngày + cùng bank info = 1 lần rút)
//         const groupedWithdrawals = [];
//         const seen = new Set();

//         for (const payout of withdrawals) {
//             const key = `${payout.bank_name}_${payout.account_number}_${payout.request_date}`;

//             if (!seen.has(key)) {
//                 seen.add(key);

//                 // Tìm tất cả payout cùng lần rút
//                 const relatedPayouts = withdrawals.filter(p => 
//                     p.bank_name === payout.bank_name &&
//                     p.account_number === payout.account_number &&
//                     new Date(p.request_date).getTime() === new Date(payout.request_date).getTime()
//                 );

//                 const totalAmount = relatedPayouts.reduce((sum, p) => sum + parseFloat(p.amount), 0);

//                 groupedWithdrawals.push({
//                     id: payout.id,
//                     withdrawal_date: payout.request_date,
//                     total_amount: totalAmount,
//                     payout_count: relatedPayouts.length,
//                     bank_name: payout.bank_name,
//                     account_number: payout.account_number,
//                     account_holder: payout.account_holder,
//                     status: payout.status,
//                     note: payout.note,
//                     payouts: relatedPayouts.map(p => ({
//                         id: p.id,
//                         amount: p.amount,
//                         status: p.status
//                     }))
//                 });
//             }
//         }

//         res.json({
//             errCode: 0,
//             data: groupedWithdrawals
//         });
//     } catch (error) {
//         console.error('Get withdrawal history error:', error);
//         res.status(500).json({
//             errCode: -1,
//             message: 'Failed to get withdrawal history'
//         });
//     }
// });

// // Request withdrawal - Provider rút những payout đã APPROVED
// router.post('/withdraw', auth, checkRole(['R2']), async (req, res) => {
//     try {
//         const { payoutIds, bankInfo } = req.body;

//         if (!payoutIds || payoutIds.length === 0) {
//             return res.status(400).json({
//                 errCode: 1,
//                 message: 'No payouts selected'
//             });
//         }

//         if (!bankInfo || !bankInfo.bankName || !bankInfo.accountNumber || !bankInfo.accountName) {
//             return res.status(400).json({
//                 errCode: 1,
//                 message: 'Bank information is required'
//             });
//         }

//         // Kiểm tra các payout có status APPROVED không
//         const payouts = await Payout.findAll({
//             where: {
//                 id: { [Op.in]: payoutIds },
//                 provider_id: req.user.id,
//                 status: 'APPROVED' // Chỉ cho rút những payout đã được admin approve
//             }
//         });

//         if (payouts.length === 0) {
//             return res.status(400).json({
//                 errCode: 1,
//                 success: false,
//                 message: 'No approved payouts found. Only approved payouts can be withdrawn.'
//             });
//         }

//         if (payouts.length !== payoutIds.length) {
//             return res.status(400).json({
//                 errCode: 1,
//                 success: false,
//                 message: 'Some payouts are not approved yet'
//             });
//         }

//         // Tính tổng số tiền
//         const totalAmount = payouts.reduce((sum, p) => sum + parseFloat(p.amount), 0);

//         // Cập nhật thông tin ngân hàng và chuyển sang PROCESSING
//         await Payout.update(
//             {
//                 bank_name: bankInfo.bankName,
//                 account_number: bankInfo.accountNumber,
//                 account_holder: bankInfo.accountName,
//                 status: 'PROCESSING', // Đang xử lý chuyển tiền
//                 note: `Withdrawal requested - Total: ${totalAmount} VND`,
//                 request_date: new Date()
//             },
//             {
//                 where: {
//                     id: { [Op.in]: payoutIds }
//                 }
//             }
//         );

//         res.status(200).json({
//             errCode: 0,
//             success: true,
//             message: 'Withdrawal request submitted successfully',
//             data: {
//                 payoutIds,
//                 totalAmount,
//                 bankInfo
//             }
//         });
//     } catch (error) {
//         console.error('Request withdrawal error:', error);
//         res.status(500).json({
//             errCode: -1,
//             success: false,
//             message: 'Failed to request withdrawal'
//         });
//     }
// });

// // Admin: Get pending payouts
// router.get('/payouts/pending', auth, checkRole(['R1']), async (req, res) => {
//     try {
//         const { limit = 50, offset = 0 } = req.query;

//         const payouts = await Payout.findAll({
//             where: { status: 'PENDING' }, // Chờ admin duyệt
//             limit: parseInt(limit),
//             offset: parseInt(offset),
//             order: [['created_at', 'ASC']]
//         });

//         res.json({
//             errCode: 0,
//             data: payouts
//         });
//     } catch (error) {
//         console.error('Get pending payouts error:', error);
//         res.status(500).json({
//             errCode: -1,
//             message: 'Failed to get pending payouts'
//         });
//     }
// });

// // Admin: Process payout (Approve/Reject)
// router.post('/payouts/:id/process', auth, checkRole(['R1']), async (req, res) => {
//     try {
//         const { action, admin_note } = req.body;

//         const payout = await Payout.findByPk(req.params.id);
//         if (!payout) {
//             return res.status(404).json({
//                 errCode: 1,
//                 message: 'Payout not found'
//             });
//         }

//         if (payout.status !== 'PENDING') {
//             return res.status(400).json({
//                 errCode: 1,
//                 message: 'Only pending payouts can be processed'
//             });
//         }

//         // Approve -> APPROVED (provider có thể rút)
//         // Reject -> REJECTED (từ chối)
//         const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';

//         await payout.update({
//             status: newStatus,
//             admin_note,
//             processed_by: req.user.id,
//             processed_at: new Date()
//         });

//         res.json({
//             errCode: 0,
//             message: `Payout ${action}d successfully`,
//             data: payout
//         });
//     } catch (error) {
//         console.error('Process payout error:', error);
//         res.status(500).json({
//             errCode: -1,
//             message: 'Failed to process payout'
//         });
//     }
// });

// // Admin: Get payout statistics
// router.get('/payouts/statistics', auth, checkRole(['R1']), async (req, res) => {
//     try {
//         const totalPending = await Payout.sum('amount', {
//             where: { status: 'PENDING' }
//         }) || 0;

//         const totalApproved = await Payout.sum('amount', {
//             where: { status: { [Op.in]: ['APPROVED', 'PROCESSING', 'COMPLETED'] } }
//         }) || 0;

//         const totalRejected = await Payout.count({
//             where: { status: 'REJECTED' }
//         });

//         res.json({
//             errCode: 0,
//             data: {
//                 totalPending,
//                 totalApproved,
//                 totalRejected
//             }
//         });
//     } catch (error) {
//         res.status(500).json({
//             errCode: -1,
//             message: 'Failed to get statistics'
//         });
//     }
// });

// // Admin: Get all payouts
// router.get('/payouts', auth, checkRole(['R1']), async (req, res) => {
//     try {
//         const { limit = 50, offset = 0, status } = req.query;

//         const where = {};
//         if (status && status !== '') where.status = status;

//         const payouts = await Payout.findAll({
//             where,
//             limit: parseInt(limit),
//             offset: parseInt(offset),
//             order: [['created_at', 'DESC']]
//         });

//         res.json({
//             errCode: 0,
//             data: payouts
//         });
//     } catch (error) {
//         res.status(500).json({
//             errCode: -1,
//             message: 'Failed to get payouts'
//         });
//     }
// });

// // Upload file
// router.post('/upload', auth, upload.single('file'), async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({
//                 errCode: 1,
//                 message: 'No file uploaded.'
//             });
//         }
//         res.status(200).json({
//             errCode: 0,
//             message: 'File uploaded successfully.',
//             file: {
//                 originalname: req.file.originalname,
//                 filename: req.file.filename,
//                 mimetype: req.file.mimetype,
//                 size: req.file.size,
//                 path: req.file.path
//             }
//         });
//     } catch (error) {
//         res.status(500).json({
//             errCode: -1,
//             message: 'File upload failed.',
//             error: error.message
//         });
//     }
// });

// export default router;
import express from 'express';
const { Op } = require('sequelize');
const Transaction = require('../models/Transaction');
const Payout = require('../models/Payout');
const { auth } = require('../../shared/middleware/auth');
const { checkRole } = require('../../shared/middleware/checkRole');
const ServiceClient = require('../../shared/utils/serviceClient');
const upload = require('../config/multerConfig');

const router = express.Router();
const datasetService = new ServiceClient(process.env.DATASET_SERVICE_URL || 'http://dataset-service:8082', 'Dataset');

// Create transaction
router.post('/', auth, async (req, res) => {
    try {
        const { datasetId, packageType, paymentMethod } = req.body;

        const dataset = await datasetService.get(`/api/datasets/${datasetId}`);

        if (!dataset || dataset.errCode !== 0) {
            return res.status(404).json({
                errCode: 1,
                message: 'Dataset not found'
            });
        }

        const priceField = {
            'BASIC': 'basicPrice',
            'STANDARD': 'standardPrice',
            'PREMIUM': 'premiumPrice'
        }[packageType.toUpperCase()];

        const amount = dataset.data[priceField];

        const transaction = await Transaction.create({
            consumer_id: req.user.id,
            data_source_id: datasetId,
            type_code: packageType === 'PREMIUM' ? 'T2' : 'T1',
            amount,
            payment_status_code: 'P1',
            payment_method: paymentMethod
        });

        // Auto-complete payment for demo
        setTimeout(async () => {
            try {
                await Transaction.update(
                    { payment_status_code: 'P2' },
                    { where: { id: transaction.id } }
                );
                console.log('✅ Payment auto-completed:', transaction.id);

                // Tạo payout với status PENDING (chờ admin duyệt)
                const provider_id = dataset.data.provider_id;
                if (provider_id) {
                    await Payout.create({
                        provider_id,
                        amount,
                        status: 'PENDING', // Chờ admin duyệt
                        note: `Payout for transaction ${transaction.id}`,
                        request_date: new Date()
                    });
                    console.log('✅ Payout created for provider:', provider_id);
                }
            } catch (error) {
                console.error('❌ Auto-complete or payout failed:', error);
            }
        }, 1000);

        res.status(201).json({
            errCode: 0,
            message: 'Transaction created successfully',
            transaction: {
                id: transaction.id,
                amount: transaction.amount
            }
        });
    } catch (error) {
        console.error('Create transaction error:', error);
        res.status(500).json({
            errCode: -1,
            message: 'Failed to create transaction',
            error: error.message
        });
    }
});

// Get user transactions
router.get('/my-transactions', auth, async (req, res) => {
    try {
        const transactions = await Transaction.findAll({
            where: { consumer_id: req.user.id },
            order: [['created_at', 'DESC']]
        });

        res.json({
            errCode: 0,
            data: transactions
        });
    } catch (error) {
        res.status(500).json({
            errCode: -1,
            message: 'Failed to get transactions'
        });
    }
});

// Check download permission
router.get('/check-permission/:datasetId', auth, async (req, res) => {
    try {
        const purchase = await Transaction.findOne({
            where: {
                consumer_id: req.user.id,
                data_source_id: req.params.datasetId,
                payment_status_code: 'P2'
            }
        });

        res.json({
            errCode: 0,
            allowed: !!purchase,
            message: purchase ? 'Access granted' : 'Purchase required'
        });
    } catch (error) {
        res.status(500).json({
            errCode: -1,
            message: 'Failed to check permission'
        });
    }
});

// Get user purchases (only successful payments) with dataset info
router.get('/purchases', auth, async (req, res) => {
    try {
        const purchases = await Transaction.findAll({
            where: { consumer_id: req.user.id, payment_status_code: 'P2' },
            order: [['created_at', 'DESC']]
        });

        const enriched = await Promise.all(purchases.map(async (t) => {
            let dataset = null;
            try {
                const ds = await datasetService.get(`/api/datasets/${t.data_source_id}`);
                if (ds && ds.errCode === 0) dataset = ds.data;
            } catch (err) {
                console.error('Failed to load dataset for purchase', t.data_source_id, err.message || err);
            }

            return {
                id: t.id,
                amount: t.amount,
                type_code: t.type_code,
                payment_status_code: t.payment_status_code,
                payment_method: t.payment_method,
                created_at: t.created_at,
                dataset
            };
        }));

        res.json({ errCode: 0, data: enriched });
    } catch (error) {
        console.error('Get purchases error:', error);
        res.status(500).json({ errCode: -1, message: 'Failed to get purchases' });
    }
});

// Payment callback (from gateway)
router.post('/callback', async (req, res) => {
    try {
        const { transactionId, status, paymentId } = req.body;

        const transaction = await Transaction.findByPk(transactionId);
        if (!transaction) {
            return res.status(404).json({
                errCode: 1,
                message: 'Transaction not found'
            });
        }

        await transaction.update({
            payment_status_code: status === 'success' ? 'P2' : 'P3',
            payment_id: paymentId
        });

        res.json({
            errCode: 0,
            message: 'Payment callback processed'
        });
    } catch (error) {
        res.status(500).json({
            errCode: -1,
            message: 'Failed to process callback'
        });
    }
});

// Simulate payment (dev mode)
router.post('/simulate/:transactionId', auth, async (req, res) => {
    try {
        const transaction = await Transaction.findByPk(req.params.transactionId);

        if (!transaction) {
            return res.status(404).json({
                errCode: 1,
                message: 'Transaction not found'
            });
        }

        await transaction.update({
            payment_status_code: 'P2'
        });

        res.json({
            errCode: 0,
            message: 'Payment simulated successfully'
        });
    } catch (error) {
        res.status(500).json({
            errCode: -1,
            message: 'Failed to simulate payment'
        });
    }
});

// ========== PAYOUT ROUTES ==========

// Get provider balance
router.get('/balance', auth, checkRole(['R2']), async (req, res) => {
    try {
        // Tổng tất cả (trừ REJECTED)
        const total = await Payout.sum('amount', {
            where: {
                provider_id: req.user.id,
                status: { [Op.ne]: 'REJECTED' }
            }
        }) || 0;

        // Có thể rút = APPROVED
        const available = await Payout.sum('amount', {
            where: {
                provider_id: req.user.id,
                status: 'APPROVED'
            }
        }) || 0;

        // Đang chờ admin duyệt = PENDING
        const pending = await Payout.sum('amount', {
            where: {
                provider_id: req.user.id,
                status: 'PENDING'
            }
        }) || 0;

        // Đã rút = COMPLETED
        const completed = await Payout.sum('amount', {
            where: {
                provider_id: req.user.id,
                status: 'COMPLETED'
            }
        }) || 0;

        res.json({
            errCode: 0,
            data: {
                total,
                available,
                pending,
                completed
            }
        });
    } catch (error) {
        console.error('Get balance error:', error);
        res.status(500).json({
            errCode: -1,
            message: 'Failed to get balance'
        });
    }
});

// THÊM MỚI: Get withdrawal history (lịch sử rút tiền)
router.get('/withdrawal-history', auth, checkRole(['R2']), async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;

        // Lấy các payout đã rút (COMPLETED)
        const withdrawals = await Payout.findAll({
            where: {
                provider_id: req.user.id,
                status: 'COMPLETED',
                bank_name: { [Op.ne]: null }
            },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['request_date', 'DESC']]
        });

        // Group theo lần rút (cùng ngày + cùng bank info = 1 lần rút)
        const groupedWithdrawals = [];
        const seen = new Set();

        for (const payout of withdrawals) {
            const key = `${payout.bank_name}_${payout.account_number}_${payout.request_date}`;

            if (!seen.has(key)) {
                seen.add(key);

                const relatedPayouts = withdrawals.filter(p =>
                    p.bank_name === payout.bank_name &&
                    p.account_number === payout.account_number &&
                    new Date(p.request_date).getTime() === new Date(payout.request_date).getTime()
                );

                const totalAmount = relatedPayouts.reduce((sum, p) => sum + parseFloat(p.amount), 0);

                groupedWithdrawals.push({
                    id: payout.id,
                    withdrawal_date: payout.request_date,
                    total_amount: totalAmount,
                    payout_count: relatedPayouts.length,
                    bank_name: payout.bank_name,
                    account_number: payout.account_number,
                    account_holder: payout.account_holder,
                    status: payout.status,
                    note: payout.note,
                    payouts: relatedPayouts.map(p => ({
                        id: p.id,
                        amount: p.amount,
                        status: p.status
                    }))
                });
            }
        }

        res.json({
            errCode: 0,
            data: groupedWithdrawals
        });
    } catch (error) {
        console.error('Get withdrawal history error:', error);
        res.status(500).json({
            errCode: -1,
            message: 'Failed to get withdrawal history'
        });
    }
});

// Get my payouts - Trả về đúng status text
router.get('/my-payouts', auth, checkRole(['R2']), async (req, res) => {
    try {
        const { limit = 50, offset = 0, status } = req.query;

        const where = { provider_id: req.user.id };

        // Filter theo status nếu có
        if (status && status !== 'all') {
            // Map frontend status sang DB status
            const statusMap = {
                'pending': 'PENDING',
                'available': 'APPROVED',
                'failed': 'REJECTED'
            };

            const dbStatus = statusMap[status.toLowerCase()];
            if (dbStatus) {
                where.status = dbStatus;
            }
        }

        const payouts = await Payout.findAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        // Map DB status về frontend status
        const mappedPayouts = payouts.map(payout => {
            const data = payout.toJSON();

            // Map status
            const statusMap = {
                'PENDING': 'pending',
                'APPROVED': 'available',
                'REJECTED': 'failed',
                'COMPLETED': 'completed'
            };

            return {
                ...data,
                status: statusMap[data.status] || data.status.toLowerCase()
            };
        });

        res.json({
            errCode: 0,
            data: mappedPayouts
        });
    } catch (error) {
        console.error('Get my payouts error:', error);
        res.status(500).json({
            errCode: -1,
            message: 'Failed to get payouts'
        });
    }
});

// THÊM MỚI: Get withdrawal history (lịch sử rút tiền)
router.get('/withdrawal-history', auth, checkRole(['R2']), async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;

        // Lấy các payout đã rút ( COMPLETED)
        const withdrawals = await Payout.findAll({
            where: {
                provider_id: req.user.id,
                status: { [Op.in]: ['COMPLETED'] },
                bank_name: { [Op.ne]: null } // Đã có thông tin ngân hàng
            },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['request_date', 'DESC']]
        });

        // Group theo lần rút (cùng ngày + cùng bank info = 1 lần rút)
        const groupedWithdrawals = [];
        const seen = new Set();

        for (const payout of withdrawals) {
            const key = `${payout.bank_name}_${payout.account_number}_${payout.request_date}`;

            if (!seen.has(key)) {
                seen.add(key);

                // Tìm tất cả payout cùng lần rút
                const relatedPayouts = withdrawals.filter(p =>
                    p.bank_name === payout.bank_name &&
                    p.account_number === payout.account_number &&
                    new Date(p.request_date).getTime() === new Date(payout.request_date).getTime()
                );

                const totalAmount = relatedPayouts.reduce((sum, p) => sum + parseFloat(p.amount), 0);

                groupedWithdrawals.push({
                    id: payout.id,
                    withdrawal_date: payout.request_date,
                    total_amount: totalAmount,
                    payout_count: relatedPayouts.length,
                    bank_name: payout.bank_name,
                    account_number: payout.account_number,
                    account_holder: payout.account_holder,
                    status: payout.status,
                    note: payout.note,
                    payouts: relatedPayouts.map(p => ({
                        id: p.id,
                        amount: p.amount,
                        status: p.status
                    }))
                });
            }
        }

        res.json({
            errCode: 0,
            data: groupedWithdrawals
        });
    } catch (error) {
        console.error('Get withdrawal history error:', error);
        res.status(500).json({
            errCode: -1,
            message: 'Failed to get withdrawal history'
        });
    }
});

// Request withdrawal - Provider rút tiền TRỰC TIẾP
router.post('/withdraw', auth, checkRole(['R2']), async (req, res) => {
    try {
        const { payoutIds, bankInfo } = req.body;

        if (!payoutIds || !Array.isArray(payoutIds) || payoutIds.length === 0) {
            return res.status(400).json({
                errCode: 1,
                success: false,
                message: 'No payouts selected'
            });
        }

        if (!bankInfo || !bankInfo.bankName || !bankInfo.accountNumber || !bankInfo.accountName) {
            return res.status(400).json({
                errCode: 1,
                success: false,
                message: 'Bank information is required'
            });
        }

        // Kiểm tra các payout có status APPROVED không
        const payouts = await Payout.findAll({
            where: {
                id: { [Op.in]: payoutIds },
                provider_id: req.user.id,
                status: 'APPROVED'
            }
        });

        if (payouts.length === 0) {
            return res.status(400).json({
                errCode: 1,
                success: false,
                message: 'No approved payouts found. Only approved payouts can be withdrawn.'
            });
        }

        if (payouts.length !== payoutIds.length) {
            return res.status(400).json({
                errCode: 1,
                success: false,
                message: `Only ${payouts.length} out of ${payoutIds.length} payouts are approved`
            });
        }

        // Tính tổng số tiền
        const totalAmount = payouts.reduce((sum, p) => sum + parseFloat(p.amount), 0);

        // Cập nhật thông tin ngân hàng và chuyển sang COMPLETED (đã rút)
        await Payout.update(
            {
                bank_name: bankInfo.bankName,
                account_number: bankInfo.accountNumber,
                account_holder: bankInfo.accountName,
                status: 'COMPLETED', // RÚT THÀNH CÔNG LUÔN
                note: `Withdrawal completed - Total: ${totalAmount} VND`,
                request_date: new Date()
            },
            {
                where: {
                    id: { [Op.in]: payoutIds }
                }
            }
        );

        res.status(200).json({
            errCode: 0,
            success: true,
            message: 'Withdrawal completed successfully',
            data: {
                payoutIds,
                totalAmount,
                bankInfo,
                status: 'COMPLETED'
            }
        });
    } catch (error) {
        console.error('Withdrawal error:', error);
        res.status(500).json({
            errCode: -1,
            success: false,
            message: 'Failed to process withdrawal: ' + error.message
        });
    }
});

// Admin: Get pending payouts
router.get('/payouts/pending', auth, checkRole(['R1']), async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;

        const payouts = await Payout.findAll({
            where: { status: 'PENDING' }, // Chờ admin duyệt
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'ASC']]
        });

        res.json({
            errCode: 0,
            data: payouts
        });
    } catch (error) {
        console.error('Get pending payouts error:', error);
        res.status(500).json({
            errCode: -1,
            message: 'Failed to get pending payouts'
        });
    }
});

// Admin: Process payout (Approve/Reject)
router.post('/payouts/:id/process', auth, checkRole(['R1']), async (req, res) => {
    try {
        const { action, admin_note } = req.body;

        const payout = await Payout.findByPk(req.params.id);
        if (!payout) {
            return res.status(404).json({
                errCode: 1,
                message: 'Payout not found'
            });
        }

        if (payout.status !== 'PENDING') {
            return res.status(400).json({
                errCode: 1,
                message: 'Only pending payouts can be processed'
            });
        }

        // Approve -> APPROVED (provider có thể rút)
        // Reject -> REJECTED (từ chối)
        const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';

        await payout.update({
            status: newStatus,
            admin_note,
            processed_by: req.user.id,
            processed_at: new Date()
        });

        res.json({
            errCode: 0,
            message: `Payout ${action}d successfully`,
            data: payout
        });
    } catch (error) {
        console.error('Process payout error:', error);
        res.status(500).json({
            errCode: -1,
            message: 'Failed to process payout'
        });
    }
});

// Admin: Get payout statistics
router.get('/payouts/statistics', auth, checkRole(['R1']), async (req, res) => {
    try {
        const totalPending = await Payout.sum('amount', {
            where: { status: 'PENDING' }
        }) || 0;

        const totalApproved = await Payout.sum('amount', {
            where: { status: { [Op.in]: ['APPROVED', 'COMPLETED'] } }
        }) || 0;

        const totalRejected = await Payout.count({
            where: { status: 'REJECTED' }
        });

        res.json({
            errCode: 0,
            data: {
                totalPending,
                totalApproved,
                totalRejected
            }
        });
    } catch (error) {
        res.status(500).json({
            errCode: -1,
            message: 'Failed to get statistics'
        });
    }
});

// Admin: Get all payouts
router.get('/payouts', auth, checkRole(['R1']), async (req, res) => {
    try {
        const { limit = 50, offset = 0, status } = req.query;

        const where = {};
        if (status && status !== '') where.status = status;

        const payouts = await Payout.findAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        res.json({
            errCode: 0,
            data: payouts
        });
    } catch (error) {
        res.status(500).json({
            errCode: -1,
            message: 'Failed to get payouts'
        });
    }
});

// Upload file
router.post('/upload', auth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                errCode: 1,
                message: 'No file uploaded.'
            });
        }
        res.status(200).json({
            errCode: 0,
            message: 'File uploaded successfully.',
            file: {
                originalname: req.file.originalname,
                filename: req.file.filename,
                mimetype: req.file.mimetype,
                size: req.file.size,
                path: req.file.path
            }
        });
    } catch (error) {
        res.status(500).json({
            errCode: -1,
            message: 'File upload failed.',
            error: error.message
        });
    }
});

export default router;