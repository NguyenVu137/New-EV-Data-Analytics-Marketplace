import axios from '../axios';

//  Provider APIs 

const getAllDatasetsService = () => {
    return axios.get('/api/datasets/my-datasets');
};

const createDatasetService = (data) => {
    return axios.post('/api/datasets/upload', data);
};

const updateDatasetService = (id, data) => {
    return axios.put(`/api/datasets/${id}`, data);
};

const deleteDatasetService = (id) => {
    return axios.delete(`/api/datasets/${id}`);
};

//  Admin APIs 

const getAllDatasetsForAdminService = () => {
    return axios.get('/api/datasets/admin/all');
};

const approveDatasetService = (id) => {
    return axios.post(`/api/datasets/${id}/approve`);
};

const rejectDatasetService = (id, reason) => {
    return axios.post(`/api/datasets/${id}/reject`, { reason });
};

//  Consumer APIs 

const getApprovedDatasetsService = () => {
    return axios.get('/api/datasets');
};

const searchDatasetsService = (params) => {
    return axios.get('/api/datasets/search', { params });
};

//  Common APIs 

const getAllCodeService = (type) => {
    return axios.get(`/api/allcode?type=${type}`);
};

export {
    // Provider
    getAllDatasetsService,
    createDatasetService,
    updateDatasetService,
    deleteDatasetService,

    // Admin
    getAllDatasetsForAdminService,
    approveDatasetService,
    rejectDatasetService,

    // Consumer
    getApprovedDatasetsService,
    searchDatasetsService,

    // Common
    getAllCodeService
};