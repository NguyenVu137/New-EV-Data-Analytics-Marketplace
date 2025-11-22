import axios from '../axios';

//  Consumer APIS 
const getDetailDatasetService = (datasetId) => {
    return axios.get(`/api/datasets/${datasetId}`);
};

const getApprovedDatasetsService = () => {
    return axios.get('/api/datasets');
};

const searchDatasetsService = (params) => {
    return axios.get('/api/datasets/search', { params });
};

const getTopDataHomeService = (limit = 10) => {
    return axios.get(`/api/datasets/top-data-home?limit=${limit}`);
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
    return axios.patch(`/api/datasets/${id}`, formData, {
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

const getAllDatasetsForAdminService = (params = {}) => {
    // Build query string from params
    const query = [];
    if (params.page) query.push(`page=${params.page}`);
    if (params.limit) query.push(`limit=${params.limit}`);
    // Nếu status là ALL thì truyền status=ALL, nếu có status khác thì truyền đúng
    if (params.status !== undefined) query.push(`status=${params.status}`);
    const queryString = query.length > 0 ? `?${query.join('&')}` : '';
    return axios.get(`/api/datasets/admin/all${queryString}`);
};

const approveDatasetService = (id) => {
    return axios.put(`/api/datasets/${id}/approve`);
};

const rejectDatasetService = (id, reason) => {
    return axios.put(`/api/datasets/${id}/reject`, { reason });
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
    getTopDataHomeService,

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