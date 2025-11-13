const express = require('express');
const router = express.Router();
const datasetController = require('../controllers/datasetController');

// Dataset routes
router.get('/datasets', datasetController.getAllDatasets);
router.get('/datasets/:id', datasetController.getDatasetById);
router.post('/datasets', datasetController.createDataset);
router.put('/datasets/:id', datasetController.updateDataset);
router.delete('/datasets/:id', datasetController.deleteDataset);
router.post('/datasets/:id/purchase', datasetController.purchaseDataset);

module.exports = router;
