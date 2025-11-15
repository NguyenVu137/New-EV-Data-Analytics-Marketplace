import axios from '../axios';

//  PURCHASE DATASET 
const purchaseDatasetService = (datasetId, packageType, paymentMethod) => {
    return axios.post('/api/transactions/purchase', {
        datasetId,
        packageType,
        paymentMethod
    });
};

//  CHECK DOWNLOAD PERMISSION 
const checkDownloadPermissionService = (datasetId) => {
    return axios.get(`/api/transactions/check-permission/${datasetId}`);
};

//  GET USER PURCHASES 
const getUserPurchasesService = () => {
    return axios.get('/api/transactions/my-purchases');
};

//  GET PROVIDER REVENUE 
const getProviderRevenueService = () => {
    return axios.get('/api/transactions/revenue');
};

//  CREATE TRANSACTION (OLD - Keep for compatibility) 
const createTransactionService = (data) => {
    return axios.post('/api/transactions', data);
};

export {
    purchaseDatasetService,
    checkDownloadPermissionService,
    getUserPurchasesService,
    getProviderRevenueService,
    createTransactionService
};