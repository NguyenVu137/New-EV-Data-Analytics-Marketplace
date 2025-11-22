const axios = require('axios');

class ServiceClient {
    constructor(baseURL, serviceName) {
        this.baseURL = baseURL;
        this.serviceName = serviceName;
        this.client = axios.create({
            baseURL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Request interceptor
        this.client.interceptors.request.use(
            (config) => {
                console.log(`[${this.serviceName}] Request:`, config.method.toUpperCase(), config.url);
                return config;
            },
            (error) => {
                console.error(`[${this.serviceName}] Request error:`, error.message);
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.client.interceptors.response.use(
            (response) => {
                console.log(`[${this.serviceName}] Response:`, response.status, response.config.url);
                return response;
            },
            (error) => {
                console.error(`[${this.serviceName}] Response error:`, error.response?.status, error.message);
                return Promise.reject(error);
            }
        );
    }

    async get(url, config = {}) {
        const response = await this.client.get(url, config);
        return response.data;
    }

    async post(url, data, config = {}) {
        const response = await this.client.post(url, data, config);
        return response.data;
    }

    async put(url, data, config = {}) {
        const response = await this.client.put(url, data, config);
        return response.data;
    }

    async delete(url, config = {}) {
        const response = await this.client.delete(url, config);
        return response.data;
    }

    setAuthToken(token) {
        this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
}

module.exports = ServiceClient;
