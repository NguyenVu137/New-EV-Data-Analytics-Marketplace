import axios from '../axios';

/**
 * User Service - All requests go through API Gateway (port 6969)
 * which routes them to User Microservice (port 7001)
 */

const handleLoginApi = (userEmail, userPassword) => {
    return axios.post('/api/login', { email: userEmail, password: userPassword });
}

const getAllUsers = (inputId) => {
    //template string
    return axios.get(`/api/get-all-users?id=${inputId}`, { id: inputId });
}

const createNewUserService = (data) => {
    return axios.post('/api/create-new-user', data);
}

const deleteUserService = (userId) => {
    return axios.delete('/api/delete-user', {
        data: {
            id: userId
        }
    });
}

const editUserService = (inputData) => {
    return axios.put('/api/edit-user', inputData)
}

const getAllCodeService = (inputType) => {
    return axios.get(`/api/allcode?type=${inputType}`);
}

/**
 * Legacy endpoints - kept for backward compatibility
 * These should be migrated to dataset service
 */
const getTopDataHomeService = (limit) => {
    return axios.get(`/api/datasets?limit=${limit}`)
}

const getAllDatas = () => {
    return axios.get(`/api/datasets`)
}

const saveDetailDataService = (data) => {
    return axios.post('/api/datasets', data);
}

const getDetailInforData = (inputId) => {
    return axios.get(`/api/datasets/${inputId}`)
}

const saveBulkScheduleData = (data) => {
    return axios.post('/api/bulk-create-schedule', data)
}

export {
    handleLoginApi, getAllUsers, createNewUserService,
    deleteUserService, editUserService, getAllCodeService,
    getTopDataHomeService, getAllDatas, saveDetailDataService,
    getDetailInforData, saveBulkScheduleData
}; 