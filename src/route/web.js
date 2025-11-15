import express from 'express'
import adminRoutes from './adminRoutes.js'
import authRoutes from './authRoutes.js'
import datasetRoutes from './datasetRoutes.js'
import transactionRoutes from './transactionRoutes.js'
import allcodeRoutes from './allcodeRoutes.js'
import analyticsRoutes from './analyticsRoutes.js'
const router = express.Router()
const initWebRoutes = (app) => {
    app.use('/api/admin', adminRoutes)
    app.use('/api/auth', authRoutes)
    app.use('/api/datasets', datasetRoutes)
    app.use('/api/transactions', transactionRoutes)
    app.use('/api/allcode', allcodeRoutes)
    app.use('/api/analytics', analyticsRoutes)
}

export default initWebRoutes

