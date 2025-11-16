import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserPurchases } from '../../../store/actions';
import { useHistory } from 'react-router-dom';
import './MyPurchases.scss';

const MyPurchases = () => {
    const dispatch = useDispatch();
    const history = useHistory();

    const { userPurchases, isLoadingPurchases, purchasesError } = useSelector(
        state => state.transaction
    );

    useEffect(() => {
        dispatch(getUserPurchases());
    }, [dispatch]);

    const getPackageType = (transaction) => {
        const dataset = transaction.dataset;
        if (!dataset) return 'Unknown';

        // Check by type_code: T2 = Subscription (Premium), T1 = Download
        if (transaction.type_code === 'T2') return 'PREMIUM';
        
        // For T1 (Download), check by amount
        const amount = parseFloat(transaction.amount);
        const basicPrice = parseFloat(dataset.basicPrice);
        const standardPrice = parseFloat(dataset.standardPrice);
        
        if (Math.abs(amount - basicPrice) < 0.01) return 'BASIC';
        if (Math.abs(amount - standardPrice) < 0.01) return 'STANDARD';
        
        return 'Unknown';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoadingPurchases) {
        return (
            <div className="my-purchases-container">
                <div className="loading-spinner">
                    <i className="fa fa-spinner fa-spin"></i> Đang tải...
                </div>
            </div>
        );
    }

    if (purchasesError) {
        return (
            <div className="my-purchases-container">
                <div className="error-message">
                    ❌ Lỗi: {purchasesError}
                </div>
            </div>
        );
    }

    return (
        <div className="my-purchases-container">
            <div className="purchases-header">
                <h1>📦 Lịch sử mua hàng</h1>
                <button className="btn-back" onClick={() => history.push('/home')}>
                    <i className="fa fa-arrow-left"></i> Quay lại
                </button>
            </div>

            {userPurchases.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🛒</div>
                    <h2>Chưa có giao dịch nào</h2>
                    <p>Bạn chưa mua dataset nào. Hãy khám phá và mua ngay!</p>
                    <button className="btn-explore" onClick={() => history.push('/home')}>
                        Khám phá Dataset
                    </button>
                </div>
            ) : (
                <div className="purchases-list">
                    {userPurchases.map(transaction => (
                        <div key={transaction.id} className="purchase-card">
                            <div className="purchase-header">
                                <h3>{transaction.dataset?.title || 'Unknown Dataset'}</h3>
                                <span className={`package-badge ${getPackageType(transaction).toLowerCase()}`}>
                                    {getPackageType(transaction)}
                                </span>
                            </div>

                            <div className="purchase-body">
                                <p className="dataset-desc">
                                    {transaction.dataset?.description?.substring(0, 100)}
                                    {transaction.dataset?.description?.length > 100 ? '...' : ''}
                                </p>

                                <div className="purchase-meta">
                                    <div className="meta-item">
                                        <span className="label">Loại:</span>
                                        <span className="value">{transaction.type?.valueVi || 'Download'}</span>
                                    </div>
                                    <div className="meta-item">
                                        <span className="label">Danh mục:</span>
                                        <span className="value">{transaction.dataset?.category?.valueVi || 'N/A'}</span>
                                    </div>
                                    <div className="meta-item">
                                        <span className="label">Ngày mua:</span>
                                        <span className="value">{formatDate(transaction.created_at)}</span>
                                    </div>
                                    <div className="meta-item amount">
                                        <span className="label">Số tiền:</span>
                                        <span className="value price">{parseFloat(transaction.amount).toLocaleString()} VNĐ</span>
                                    </div>
                                </div>
                            </div>

                            <div className="purchase-footer">
                                <button
                                    className="btn-view-detail"
                                    onClick={() => history.push(`/detail-data/${transaction.dataset?.id}`)}
                                >
                                    <i className="fa fa-eye"></i> Xem chi tiết
                                </button>

                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyPurchases;