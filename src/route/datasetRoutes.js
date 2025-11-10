import express from 'express';
import * as datasetController from '../controllers/datasetController';
import { auth } from '../middlewares/auth';
import { checkRole } from '../middlewares/checkRole';

const router = express.Router();

// Consumer (R3)
router.get('/', auth, checkRole(['R3', 'R2', 'R1']), datasetController.getApprovedDatasets);
router.get('/search', auth, checkRole(['R3', 'R2', 'R1']), datasetController.searchDatasets);

// Provider (R2)
router.post('/upload', auth, checkRole(['R2', 'R1']), datasetController.uploadDataset);

// Admin (R1)
router.post('/:id/approve', auth, checkRole('R1'), datasetController.approveDataset);

export default router;
