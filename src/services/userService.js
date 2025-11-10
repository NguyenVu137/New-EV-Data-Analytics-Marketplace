import axios from '../axios';


const handleLoginApi = (userEmail, userPassword) => {
    return axios.post('/api/auth/login', { email: userEmail, password: userPassword });
}

const handleRegisterApi = (data) => {
    return axios.post('/api/auth/register', {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address,
        phoneNumber: data.phoneNumber,
        gender: data.gender,
        role: data.role,
        image: data.image || null
    });
};

const getAllUsers = () => {
    return axios.get('/api/admin/users');
}

const createNewUserService = (data) => {
    return axios.post('/api/admin/users', data);
}

const deleteUserService = (userId) => {
    return axios.delete('/api/admin/users', { data: { id: userId } });
}

const editUserService = (inputData) => {
    return axios.put('/api/admin/users', inputData);
}

const getAllCodeService = (inputType) => {
    return axios.get(`/api/allcode?type=${inputType}`);
}

export {
    handleRegisterApi,
    handleLoginApi,
    getAllUsers,
    createNewUserService,
    deleteUserService,
    editUserService,
    getAllCodeService
};
