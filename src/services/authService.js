// src/services/authService.js
import axios from '../axios'; // file axios instance (baseURL + token)

const API_URL = '/api/login'; // backend endpoint

export const handleLoginApi = async (email, password) => {
    try {
        const response = await axios.post(API_URL, { email, password });
        return response.data; // { errCode, message, user, token }
    } catch (error) {
        if (error.response && error.response.data) {
            return error.response.data;
        }
        return { errCode: -1, message: 'Server error' };
    }
};

export const validateTokenApi = async (token) => {
    try {
        const response = await axios.post('/api/validate', {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        if (error.response && error.response.data) {
            return error.response.data;
        }
        return { errCode: -1, message: 'Server error' };
    }
};
