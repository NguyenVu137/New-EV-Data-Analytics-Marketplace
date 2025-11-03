import axios from '../axios';

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

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const getAllCodeService = (inputType) => {
    console.log(`${BACKEND_URL}/api/allcode?type=${inputType}`);
    return axios.get(`${BACKEND_URL}/api/allcode?type=${inputType}`);
}
export { handleLoginApi, getAllUsers, createNewUserService, deleteUserService, editUserService, getAllCodeService }; 