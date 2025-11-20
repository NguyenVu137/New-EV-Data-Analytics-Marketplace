import axios from '../axios';
import * as queryString from 'query-string';

/**
 * Admin Service - All requests go through API Gateway (port 6969)
 * which routes them to User Microservice (port 7001)
 */

const adminService = {

    /**
     * Admin login endpoint
     * Routes through API Gateway to User Microservice
     * {
     *  "email": "string",
     *  "password": "string"
     * }
     */
    login(loginBody) {
        return axios.post(`/api/login`, loginBody)
    },

};

export default adminService;