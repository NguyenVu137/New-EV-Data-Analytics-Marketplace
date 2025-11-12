import axios from '../axios';

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

const approveDatasetService = (id) => {
    return axios.post(`/api/datasets/${id}/approve`);
};

const rejectDatasetService = (id, reason) => {
    return axios.post(`/api/datasets/${id}/reject`, { reason });
};

const getAllCodeService = (type) => {
    return axios.get(`/api/allcode?type=${type}`);
};
export {
    getAllCodeService,
    getAllDatasetsService,
    createDatasetService,
    updateDatasetService,
    deleteDatasetService,
    approveDatasetService,
    rejectDatasetService
};