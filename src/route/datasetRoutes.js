import express from 'express';
import * as datasetController from '../controllers/datasetController';
import * as providerController from '../controllers/providerController';
import { auth } from '../middlewares/auth';
import { checkRole } from '../middlewares/checkRole';

const router = express.Router();

// Consumer (R3)
router.get('/', auth, checkRole(['R3', 'R2', 'R1']), datasetController.getApprovedDatasets);
router.get('/search', auth, checkRole(['R3', 'R2', 'R1']), datasetController.searchDatasets);

//Admin(R1)
router.get('/admin/all', auth, checkRole('R1'), datasetController.getAllDatasetsForAdmin);

// Provider (R2)
router.get('/my-datasets', auth, checkRole(['R2', 'R1']), providerController.getMyDatasets);
router.post('/upload', auth, checkRole(['R2', 'R1']), providerController.uploadDataset);
router.put('/:id', auth, checkRole(['R2', 'R1']), providerController.updateDataset);
router.delete('/:id', auth, checkRole(['R2', 'R1']), providerController.deleteDataset);

// Admin (R1): Approve/Reject datasets
router.post('/:id/approve', auth, checkRole('R1'), datasetController.approveDataset);
router.post('/:id/reject', auth, checkRole('R1'), datasetController.rejectDataset);
export default router;