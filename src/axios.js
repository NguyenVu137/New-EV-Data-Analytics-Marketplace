import axios from 'axios';

// API Gateway (routes all requests)
const GATEWAY_URL = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:6969';

// Individual Microservices (for direct calls if needed)
const SERVICES = {
    USER_SERVICE: process.env.REACT_APP_USER_SERVICE_URL || 'http://localhost:7001',
    DATASET_SERVICE: process.env.REACT_APP_DATASET_SERVICE_URL || 'http://localhost:7002',
    PAYMENT_SERVICE: process.env.REACT_APP_PAYMENT_SERVICE_URL || 'http://localhost:7003',
    ANALYTICS_SERVICE: process.env.REACT_APP_ANALYTICS_SERVICE_URL || 'http://localhost:7004'
};

/**
 * Main Backend Axios Instance (uses API Gateway)
 * API Gateway routes all requests to appropriate microservices
 * Gateway runs on port 6969
 */
const instance = axios.create({
    baseURL: GATEWAY_URL,
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
                message: error.response.data?.message || error.message,
                endpoint: error.config?.url
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
        
        // Add userId header for API calls
        const userId = localStorage.getItem('userId');
        if (userId) {
            config.headers['x-user-id'] = userId;
            console.log('[Axios] Added x-user-id header:', userId, 'for endpoint:', config.url);
        } else {
            console.log('[Axios] No userId in localStorage for endpoint:', config.url);
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Export axios instances
export default instance;
export { GATEWAY_URL, SERVICES };