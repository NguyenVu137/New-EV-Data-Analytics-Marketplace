import axios from '../axios';

//  Consumer APIS 
const getDetailDatasetService = (datasetId) => {
    return axios.get(`/api/datasets/detail/${datasetId}`);
};

const getApprovedDatasetsService = () => {
    return axios.get('/api/datasets');
};

const searchDatasetsService = (params) => {
    return axios.get('/api/datasets/search', { params });
};

//  Provider APIs  

const getAllDatasetsService = () => {
    return axios.get('/api/datasets/my-datasets');
};

const createDatasetService = (formData) => {
    return axios.post('/api/datasets/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

const updateDatasetService = (id, formData) => {
    return axios.put(`/api/datasets/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

const deleteDatasetService = (id) => {
    return axios.delete(`/api/datasets/${id}`);
};

const deleteFileService = (fileId) => {
    return axios.delete(`/api/datasets/files/${fileId}`);
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

//  Common APIs 

const getAllCodeService = (type) => {
    return axios.get(`/api/allcode?type=${type}`);
};

export {
    // Consumer
    getDetailDatasetService,
    getApprovedDatasetsService,
    searchDatasetsService,

    // Provider
    getAllDatasetsService,
    createDatasetService,
    updateDatasetService,
    deleteDatasetService,
    deleteFileService,

    // Admin
    getAllDatasetsForAdminService,
    approveDatasetService,
    rejectDatasetService,

    // Common
    getAllCodeService
};