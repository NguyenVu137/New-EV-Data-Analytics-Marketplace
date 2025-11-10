import express from 'express'
import * as allcodeController from '../controllers/allcodeController.js'

const router = express.Router()

router.get('/', allcodeController.getAllCode)

export default router
