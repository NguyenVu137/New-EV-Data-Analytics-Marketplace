// ⚠️ THIS FILE IS NOT USED - Use REACT_APP_BACKEND_URL from .env instead
// Keeping for backward compatibility but all configs should be in .env
/*
export default {
    api: {
        API_BASE_URL: "http://localhost:8080/",
        ROUTER_BASE_NAME: null,
    },
    app: {
        ROUTER_BASE_NAME: null,
    }
};
*/

export default {
    api: {
        // Use environment variables instead
        API_BASE_URL: process.env.REACT_APP_BACKEND_URL || "http://localhost:6969/",
        ROUTER_BASE_NAME: process.env.REACT_APP_ROUTER_BASE_NAME || null,
    },
    app: {
        ROUTER_BASE_NAME: process.env.REACT_APP_ROUTER_BASE_NAME || null,
    }
};
 