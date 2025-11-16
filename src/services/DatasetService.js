import axios from '../axios';

const DatasetService = {
    async getDatasetById(id) {
        // Call backend API (http://localhost:6974/api/datasets/:id)
        const response = await axios.get(`/api/datasets/${id}`);
        // Normalize payload so components always receive expected fields
        const payload = response.data || {};
        // prefer DB snake_case fields, but fill from virtuals if missing
        if (payload.prices) {
            if (payload.basic_price === undefined || payload.basic_price === null) payload.basic_price = payload.prices.basic != null ? String(payload.prices.basic) : payload.basic_price;
            if (payload.standard_price === undefined || payload.standard_price === null) payload.standard_price = payload.prices.standard != null ? String(payload.prices.standard) : payload.standard_price;
            if (payload.premium_price === undefined || payload.premium_price === null) payload.premium_price = payload.prices.premium != null ? String(payload.prices.premium) : payload.premium_price;
        }
        // ensure upload_date present (may be uploadDate virtual)
        if ((payload.upload_date === undefined || payload.upload_date === null) && payload.uploadDate) payload.upload_date = payload.uploadDate;
        // ensure priceAmount available
        if ((payload.priceAmount === undefined || payload.priceAmount === null) && payload.price != null) payload.priceAmount = payload.price;
        return payload;
    },

    async purchaseDataset(id, priceType) {
        const response = await axios.post(`/api/datasets/${id}/purchase`, {
            priceType
        });
        return response.data;
    },

    async getAllDatasets(params = {}) {
        const response = await axios.get('/api/datasets', { params });
        return response.data;
    },

    async searchDatasets(query) {
        const response = await axios.get('/api/datasets/search', {
            params: { q: query }
        });
        return response.data;
    }
};

export default DatasetService;
