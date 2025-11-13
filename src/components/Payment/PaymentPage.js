import React, { useEffect, useMemo } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import PackageSelection from './PackageSelection';
import PaymentMethodSelection from './PaymentMethodSelection';
import { usePayment } from '../../hooks/usePayment';
import './PaymentPage.css';

/**
 * Payment Methods Configuration
 * Centralized payment methods with fees and processing time
 */
const PAYMENT_METHODS = Object.freeze([
    {
        id: 'creditcard',
        name: 'Thẻ tín dụng/Ghi nợ',
        description: 'Visa, Mastercard, JCB',
        icon: 'cc-visa',
        status: 'active',
        fee: 0,
        processingTime: '1-2 ngày'
    },
    {
        id: 'bank',
        name: 'Chuyển khoản ngân hàng',
        description: 'Ngân hàng Việt Nam',
        icon: 'building',
        status: 'active',
        fee: 0,
        processingTime: '1-3 ngày'
    },
    {
        id: 'momo',
        name: 'Ví điện tử Momo',
        description: 'Thanh toán qua Momo',
        icon: 'mobile',
        status: 'active',
        fee: 0.01,
        processingTime: 'Tức thì'
    },
    {
        id: 'zalopay',
        name: 'ZaloPay',
        description: 'Ứng dụng ZaloPay',
        icon: 'wallet',
        status: 'maintenance',
        fee: 0.01,
        processingTime: 'Tức thì'
    }
]);

/**
 * Error Messages
 */
const ERROR_MESSAGES = {
    NO_DATASET: 'Không tìm thấy thông tin gói dữ liệu',
    NO_PAYMENT_METHOD: 'Vui lòng chọn phương thức thanh toán',
    INVALID_DATASET: 'Dữ liệu gói không hợp lệ'
};

/**
 * Payment Page Component
 * Handles dataset purchase flow with packages and payment methods
 */
const PaymentPage = () => {
    const location = useLocation();
    const history = useHistory();
    const dataset = location.state?.dataset;

    // Payment hook with enhanced error handling
    const {
        selectedPackage,
        setSelectedPackage,
        selectedPaymentMethod,
        setSelectedPaymentMethod,
        loading,
        error,
        handlePurchase
    } = usePayment(dataset);

    // Validate dataset on mount
    useEffect(() => {
        if (!dataset) {
            console.warn('No dataset provided');
        }
    }, [dataset]);

    // Memoized dataset validation
    const isValidDataset = useMemo(() => {
        return dataset && 
               dataset.id && 
               dataset.name &&
               (dataset.basic_price || 
                dataset.standard_price || 
                dataset.premium_price);
    }, [dataset]);

    // Memoized data details
    const dataDetails = useMemo(() => ({
        format: dataset?.format || 'CSV, JSON',
        region: dataset?.region || 'Toàn quốc',
        provider: dataset?.provider || 'N/A',
        dataType: dataset?.data_type || 'N/A',
        vehicleType: dataset?.vehicle_type || 'Ô tô điện',
        batteryType: dataset?.battery_type || 'LFP',
        description: dataset?.description || '',
        updatedAt: dataset?.updated_at || new Date().toISOString()
    }), [dataset]);

    // Memoized packages array
    const packages = useMemo(() => [
        {
            id: 'basic',
            name: 'Theo lượt tải',
            period: '/lượt',
            description: 'Phù hợp cho người dùng cần dữ liệu một lần',
            price: dataset?.basic_price || 0,
            features: [
                'Tải xuống dữ liệu một lần',
                'Truy cập đầy đủ dữ liệu gốc',
                'Hỗ trợ kỹ thuật cơ bản',
                'License sử dụng vĩnh viễn',
                'Cập nhật dữ liệu lần tải'
            ],
            buttonText: 'Mua ngay',
            recommended: false,
            bestFor: 'Người dùng cá nhân'
        },
        {
            id: 'standard',
            name: 'Gói thuê bao',
            period: '/tháng',
            description: 'Dành cho người dùng cần truy cập thường xuyên',
            price: dataset?.standard_price || 0,
            features: [
                'Truy cập không giới hạn trong thời hạn',
                'Tải xuống không giới hạn',
                'Cập nhật dữ liệu liên tục',
                'Hỗ trợ kỹ thuật ưu tiên',
                'API truy vấn dữ liệu cơ bản'
            ],
            buttonText: 'Đăng ký ngay',
            recommended: true,
            bestFor: 'Công ty nhỏ, startup'
        },
        {
            id: 'premium',
            name: 'API Access',
            period: '/tháng',
            description: 'Tích hợp dữ liệu vào hệ thống',
            price: dataset?.premium_price || 0,
            features: [
                'API key riêng biệt',
                'Không giới hạn số lượng request',
                'Tài liệu API đầy đủ',
                'Hỗ trợ kỹ thuật 24/7',
                'Dashboard thống kê chi tiết'
            ],
            buttonText: 'Kích hoạt API',
            recommended: false,
            bestFor: 'Doanh nghiệp lớn, tích hợp'
        }
    ], [dataset]);

    // Error page
    if (!isValidDataset) {
        return (
            <div className="payment-error-wrapper">
                <div className="payment-error">
                    <div className="error-container">
                        <div className="error-icon">
                            <i className="fas fa-exclamation-triangle"></i>
                        </div>
                        <h2>{ERROR_MESSAGES.NO_DATASET}</h2>
                        <p>Vui lòng quay lại trang danh sách để chọn gói dữ liệu.</p>
                        <div className="error-actions">
                            <button 
                                className="error-button primary"
                                onClick={() => history.push('/home')}
                            >
                                <i className="fas fa-arrow-left"></i> Quay lại danh sách
                            </button>
                            <button 
                                className="error-button secondary"
                                onClick={() => history.push('/home')}
                            >
                                <i className="fas fa-home"></i> Trang chủ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-page">
            <div className="payment-container">
                {/* Header */}
                <div className="payment-header">
                    <h1 className="dataset-title">{dataset.name}</h1>
                    <div className="payment-breadcrumb">
                        <button onClick={() => history.push('/home')}>
                            Danh sách gói dữ liệu
                        </button>
                        <span>/</span>
                        <span className="current">{dataset.name}</span>
                    </div>
                </div>

                {/* Dataset Info Section */}
                <div className="dataset-main">
                    {/* Preview */}
                    <div className="dataset-preview">
                        <div className="image-placeholder">
                            <span className="placeholder-initial">
                                {(dataset.name || '').slice(0, 1).toUpperCase()}
                            </span>
                            <div className="placeholder-badge">
                                <i className="fas fa-database"></i>
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="dataset-details">
                        <h2>
                            <i className="fas fa-info-circle"></i> Thông tin chi tiết
                        </h2>
                        <div className="details-grid">
                            <div className="detail-item">
                                <h3>
                                    <i className="fas fa-file-csv"></i> Định dạng
                                </h3>
                                <p>{dataDetails.format}</p>
                            </div>
                            <div className="detail-item">
                                <h3>
                                    <i className="fas fa-tag"></i> Loại dữ liệu
                                </h3>
                                <p>{dataDetails.dataType}</p>
                            </div>
                            <div className="detail-item">
                                <h3>
                                    <i className="fas fa-map-marker-alt"></i> Khu vực
                                </h3>
                                <p>{dataDetails.region}</p>
                            </div>
                            <div className="detail-item">
                                <h3>
                                    <i className="fas fa-user-tie"></i> Nhà cung cấp
                                </h3>
                                <p>{dataDetails.provider}</p>
                            </div>
                            <div className="detail-item">
                                <h3>
                                    <i className="fas fa-car"></i> Loại xe
                                </h3>
                                <p>{dataDetails.vehicleType}</p>
                            </div>
                            <div className="detail-item">
                                <h3>
                                    <i className="fas fa-bolt"></i> Loại pin
                                </h3>
                                <p>{dataDetails.batteryType}</p>
                            </div>
                        </div>

                        {/* Meta Info */}
                        <div className="dataset-meta">
                            <div className="meta-item">
                                <i className="fas fa-download"></i>
                                <span>Cập nhật: {new Date(dataDetails.updatedAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                            {dataset.records_count && (
                                <div className="meta-item">
                                    <i className="fas fa-list"></i>
                                    <span>{dataset.records_count.toLocaleString('vi-VN')} bản ghi</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    {dataDetails.description && (
                        <div className="dataset-description">
                            <h3>
                                <i className="fas fa-book"></i> Mô tả
                            </h3>
                            <p>{dataDetails.description}</p>
                        </div>
                    )}
                </div>

                {/* Package Selection */}
                <PackageSelection 
                    packages={packages}
                    selected={selectedPackage}
                    onSelect={setSelectedPackage}
                />

                {/* Payment Method Selection */}
                <PaymentMethodSelection
                    methods={PAYMENT_METHODS}
                    selected={selectedPaymentMethod}
                    onSelect={setSelectedPaymentMethod}
                />

                {/* Error Message */}
                {error && (
                    <div className="error-message-box">
                        <div className="error-icon">
                            <i className="fas fa-exclamation-circle"></i>
                        </div>
                        <div className="error-content">
                            <h4>Lỗi thanh toán</h4>
                            <p>{error}</p>
                        </div>
                        <button 
                            className="error-close"
                            onClick={() => window.location.reload()}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                )}

                {/* Payment Action */}
                <div className="payment-action-wrapper">
                    <div className="payment-summary">
                        {selectedPackage && (
                            <>
                                <h3>Tóm tắt đơn hàng</h3>
                                <div className="summary-item">
                                    <span>Gói dữ liệu:</span>
                                    <strong>{packages.find(p => p.id === selectedPackage)?.name}</strong>
                                </div>
                                <div className="summary-item">
                                    <span>Phương thức:</span>
                                    <strong>
                                        {PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod)?.name || 'Chưa chọn'}
                                    </strong>
                                </div>
                                <div className="summary-item price">
                                    <span>Tổng tiền:</span>
                                    <strong>
                                        ₫{(packages.find(p => p.id === selectedPackage)?.price || 0)
                                            .toLocaleString('vi-VN')}
                                    </strong>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="payment-action">
                        <button 
                            className={`payment-button ${loading ? 'loading' : ''} ${!selectedPaymentMethod ? 'disabled' : ''}`}
                            onClick={handlePurchase}
                            disabled={loading || !selectedPaymentMethod}
                            title={!selectedPaymentMethod ? ERROR_MESSAGES.NO_PAYMENT_METHOD : ''}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    <span>Đang xử lý thanh toán...</span>
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-lock"></i>
                                    <span>Tiến hành thanh toán</span>
                                </>
                            )}
                        </button>

                        {!selectedPaymentMethod && (
                            <div className="payment-hint-alert">
                                <i className="fas fa-info-circle"></i>
                                <span>{ERROR_MESSAGES.NO_PAYMENT_METHOD}</span>
                            </div>
                        )}

                        {selectedPaymentMethod && (
                            <div className="payment-info">
                                <i className="fas fa-shield-alt"></i>
                                <p>Giao dịch của bạn được bảo mật bằng SSL 256-bit</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
