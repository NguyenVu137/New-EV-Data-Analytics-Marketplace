import React, { useState, useEffect } from 'react';
import { Spin, message } from 'antd';
import Navbar from '../../components/Navbar';
import DatasetDetail from '../../components/DatasetDetail/DatasetDetail';
import DatasetService from '../../services/DatasetService';

const DatasetDetailPage = (props) => {
    const id = props.match.params.id;
    const history = props.history;
    const [dataset, setDataset] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDataset();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const loadDataset = async () => {
        try {
            setLoading(true);
            const response = await DatasetService.getDatasetById(id);
            setDataset(response);
        } catch (error) {
            message.error('Không thể tải thông tin chi tiết gói dữ liệu');
            console.error('Error loading dataset:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async (priceType) => {
        try {
            const response = await DatasetService.purchaseDataset(id, priceType);
            if (response.redirectUrl) {
                window.location.href = response.redirectUrl;
            }
        } catch (error) {
            message.error('Có lỗi xảy ra trong quá trình thanh toán');
            console.error('Error purchasing dataset:', error);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
                <p>Đang tải thông tin...</p>
            </div>
        );
    }

    if (!dataset) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <h2>Không tìm thấy gói dữ liệu</h2>
                <button onClick={() => history.push('/home')}>Quay lại trang chủ</button>
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <DatasetDetail dataset={dataset} onPurchase={handlePurchase} />
        </div>
    );
};

export default DatasetDetailPage;
