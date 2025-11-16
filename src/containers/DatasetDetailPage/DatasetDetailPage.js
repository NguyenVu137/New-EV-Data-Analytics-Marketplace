import React, { useState, useEffect } from 'react';
import { Spin, message } from 'antd';
import { connect } from 'react-redux';
import Navbar from '../../components/Navbar';
import DatasetDetail from '../../components/DatasetDetail/DatasetDetail';
import DatasetService from '../../services/DatasetService';

const DatasetDetailPage = (props) => {
    const id = props.match.params.id;
    const history = props.history;
    const [dataset, setDataset] = useState(null);
    const [loading, setLoading] = useState(true);
    const isLoggedIn = props.isLoggedIn;

    useEffect(() => {
        loadDataset();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isLoggedIn]);

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
        // Check if user is logged in from Redux state only
        if (!isLoggedIn) {
            // Store the payment info in sessionStorage before redirecting to login
            sessionStorage.setItem('pendingPurchase', JSON.stringify({
                datasetId: id,
                packageType: priceType
            }));
            // Redirect to login
            message.info('Vui lòng đăng nhập để tiếp tục');
            history.push('/login');
            return;
        }

        try {
            // Navigate to payment page with dataset info
            history.push({
                pathname: `/payment/${id}`,
                state: { 
                    dataset: dataset,
                    selectedPackage: priceType
                }
            });
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

const mapStateToProps = state => {
    return {
        isLoggedIn: state.user.isLoggedIn
    };
};

export default connect(mapStateToProps)(DatasetDetailPage);
