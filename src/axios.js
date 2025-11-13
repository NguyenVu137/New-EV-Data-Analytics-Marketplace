import axios from 'axios';

/**
 * Main Backend Axios Instance
 * Backend runs on port 6969
 * Supports environment variable override for different environments
 */
const instance = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:6969',
    timeout: 10000, // 10 second timeout
    headers: {
        'Content-Type': 'application/json'
    }
});

/**
 * Response interceptor - extract data from response
 */
instance.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        // Handle error responses
        if (error.response) {
            // Server responded with error
            console.error('API Error:', {
                status: error.response.status,
                message: error.response.data?.message || error.message
            });
        } else if (error.request) {
            // Request made but no response
            console.error('No response from server:', error.request);
        } else {
            // Error in request setup
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    }
);

/**
 * Request interceptor - add auth token if available
 */
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default instance;