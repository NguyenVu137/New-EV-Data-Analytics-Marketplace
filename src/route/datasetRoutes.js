import express from 'express';
import * as datasetController from '../controllers/datasetController';
import * as providerController from '../controllers/providerController';
import * as consumerController from '../controllers/consumerController';
import { auth } from '../middlewares/auth';
import { checkRole } from '../middlewares/checkRole';
import upload from '../config/multerConfig';
import { checkPurchasePermission } from '../middlewares/checkPurchasePermission';
const router = express.Router();

// Consumer (R3)
router.get('/', auth, checkRole(['R3', 'R2', 'R1']), datasetController.getApprovedDatasets);
router.get('/search', auth, checkRole(['R3', 'R2', 'R1']), datasetController.searchDatasets);
router.get('/top-data-home', auth, checkRole(['R3', 'R2', 'R1']), datasetController.getTopDataHome);
router.get('/detail/:id', auth, checkRole(['R1', 'R2', 'R3']), consumerController.getDetailDatasetById);
router.get('/download/:fileId', auth, checkRole(['R3', 'R2', 'R1']), checkPurchasePermission, providerController.downloadFile);
// Admin (R1)
router.get('/admin/all', auth, checkRole('R1'), datasetController.getAllDatasetsForAdmin);
// Provider(R2)
router.get('/my-datasets', auth, checkRole(['R2', 'R1']), providerController.getMyDatasets);

router.post('/upload', auth, checkRole(['R2', 'R1']), upload.array('files', 10), providerController.uploadDataset);

router.put('/:id', auth, checkRole(['R2', 'R1']), upload.array('files', 10), providerController.updateDataset);

router.delete('/:id', auth, checkRole(['R2', 'R1']), providerController.deleteDataset);

router.delete('/files/:fileId', auth, checkRole(['R2', 'R1']), providerController.deleteFile);

// Admin (R1): Approve/Reject datasets
router.post('/:id/approve', auth, checkRole('R1'), datasetController.approveDataset);
router.post('/:id/reject', auth, checkRole('R1'), datasetController.rejectDataset);

export default router;