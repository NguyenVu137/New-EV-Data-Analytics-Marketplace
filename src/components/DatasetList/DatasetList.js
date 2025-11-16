import React, { useState, useEffect } from 'react';
import DatasetService from '../services/DatasetService';

import './DatasetList.css';

const DatasetList = () => {
    const [datasets, setDatasets] = useState({ items: [], total: 0, page: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadDatasets();
    }, []);

    const loadDatasets = async () => {
        try {
            const response = await DatasetService.getAllDatasets({ page: 1, perPage: 12 });
            if (response && response.items) {
                setDatasets(response);
                setLoading(false);
            } else {
                throw new Error('Dữ liệu không đúng định dạng');
            }
        } catch (err) {
            console.error('Error loading datasets:', err);
            setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
            setLoading(false);
        }
    };

    if (loading) return <div>Loading datasets...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="dataset-list">
            <h2>Available Datasets</h2>
            <div className="dataset-grid">
                {datasets.items && datasets.items.map(dataset => (
                    <div key={dataset.id} 
                        className="dataset-card" 
                        onClick={() => window.location.href = `/home/${dataset.id}`}
                    >
                        <h3>{dataset.name}</h3>
                        <div className="dataset-type">{dataset.data_type}</div>
                        <p className="dataset-description">{dataset.description}</p>
                        <div className="dataset-meta">
                            <span>Khu vực: {dataset.region}</span>
                            <span>Định dạng: {dataset.format}</span>
                            <span>Nhà cung cấp: {dataset.provider}</span>
                        </div>
                        <div className="dataset-price">
                            <div>Theo lượt tải: {Number(dataset.basic_price).toLocaleString()} VNĐ</div>
                            <div>Gói thuê bao: {Number(dataset.standard_price).toLocaleString()} VNĐ</div>
                            <div>API Access: {Number(dataset.premium_price).toLocaleString()} VNĐ</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DatasetList;
