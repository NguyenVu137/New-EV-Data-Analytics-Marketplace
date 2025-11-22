import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTransaction, simulatePayment } from '../../../store/actions';
import './PaymentModal.scss';

const PaymentModal = ({ isOpen, onClose, dataset, onPurchaseSuccess }) => {
    const dispatch = useDispatch();
    const [selectedPackage, setSelectedPackage] = useState('BASIC');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('PM3'); // MoMo default
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingTransaction, setPendingTransaction] = useState(null);

    const isPurchasing = useSelector(state => state.transaction?.isPurchasing || false);

    const packages = [
        {
            type: 'BASIC',
            name: 'Basic',
            price: dataset?.basicPrice || 0,
            features: ['Download 1 lần', 'Truy cập đầy đủ dữ liệu', 'Hỗ trợ qua email']
        },
        {
            type: 'STANDARD',
            name: 'Standard',
            price: dataset?.standardPrice || 0,
            features: ['Download 10 lần', 'Truy cập đầy đủ dữ liệu', 'Hỗ trợ ưu tiên', 'Cập nhật miễn phí']
        },
        {
            type: 'PREMIUM',
            name: 'Premium',
            price: dataset?.premiumPrice || 0,
            features: ['Download không giới hạn', 'Truy cập đầy đủ dữ liệu', 'Hỗ trợ 24/7', 'Cập nhật miễn phí', 'API access', 'Thời hạn: 1 tháng']
        }
    ];

    const paymentMethods = [
        { code: 'PM3', name: 'MoMo E-Wallet', icon: '💳' },
        { code: 'PM4', name: 'ZaloPay', icon: '💵' },
        { code: 'PM5', name: 'VNPay', icon: '🏦' },
        { code: 'PM2', name: 'Bank Transfer', icon: '🏛️' },
        { code: 'PM1', name: 'Credit/Debit Card', icon: '💳' }
    ];

    const handlePurchase = async () => {
        try {
            const result = await dispatch(createTransaction(
                dataset.id,
                selectedPackage,
                selectedPaymentMethod
            ));

            console.log('Purchase result in PaymentModal:', result);

            if (result && result.errCode === 0) {
                alert('✅ Đơn hàng đã được tạo! Đang xử lý thanh toán...');

                // Close modal first
                handleClose();

                // Wait for backend auto-complete (1 second) + buffer
                setTimeout(async () => {
                    if (onPurchaseSuccess) {
                        await onPurchaseSuccess(result);
                    }
                    alert('✅ Thanh toán thành công! Bạn có thể download dataset ngay bây giờ.');
                }, 2000);
            } else {
                alert(`❌ Lỗi: ${result?.message || 'Không thể tạo đơn hàng'}`);
            }
        } catch (error) {
            console.error('Purchase error:', error);
            alert('❌ Có lỗi xảy ra khi thanh toán!');
        }
    };

    const confirmPayment = async () => {
        if (!pendingTransaction) return;

        try {
            const result = await dispatch(simulatePayment(pendingTransaction.id, 'success'));

            console.log('Confirm payment result:', result);

            if (result && result.errCode === 0) {
                alert('✅ Thanh toán thành công! Bạn có thể download dataset ngay bây giờ.');
                if (onPurchaseSuccess) {
                    onPurchaseSuccess(result.data);
                }
                handleClose();
            } else {
                alert(`❌ Thanh toán thất bại: ${result?.message}`);
            }
        } catch (error) {
            console.error('Confirm payment error:', error);
            alert('❌ Có lỗi xảy ra khi xác nhận thanh toán!');
        }
    };

    const handleClose = () => {
        setShowConfirm(false);
        setPendingTransaction(null);
        setSelectedPackage('BASIC');
        setSelectedPaymentMethod('PM3');
        onClose();
    };

    if (!isOpen) return null;

    const selectedPackageInfo = packages.find(p => p.type === selectedPackage);

    return (
        <div className="payment-modal-overlay" onClick={onClose}>
            <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>×</button>

                <h2>Mua Dataset</h2>
                <p className="dataset-title">{dataset?.title}</p>

                {/* Package Selection */}
                <div className="section">
                    <h3>Chọn gói</h3>
                    <div className="packages">
                        {packages.map(pkg => (
                            <div
                                key={pkg.type}
                                className={`package-card ${selectedPackage === pkg.type ? 'selected' : ''}`}
                                onClick={() => setSelectedPackage(pkg.type)}
                            >
                                <div className="package-header">
                                    <h4>{pkg.name}</h4>
                                    <div className="price">{pkg.price.toLocaleString()} VNĐ</div>
                                </div>
                                <ul className="features">
                                    {pkg.features.map((feature, idx) => (
                                        <li key={idx}>✓ {feature}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment Method Selection */}
                <div className="section">
                    <h3>Phương thức thanh toán</h3>
                    <div className="payment-methods">
                        {paymentMethods.map(method => (
                            <div
                                key={method.code}
                                className={`payment-method ${selectedPaymentMethod === method.code ? 'selected' : ''}`}
                                onClick={() => setSelectedPaymentMethod(method.code)}
                            >
                                <span className="icon">{method.icon}</span>
                                <span className="name">{method.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Summary */}
                <div className="summary">
                    <div className="summary-row">
                        <span>Gói:</span>
                        <span>{selectedPackageInfo?.name}</span>
                    </div>
                    <div className="summary-row total">
                        <span>Tổng cộng:</span>
                        <span>{selectedPackageInfo?.price.toLocaleString()} VNĐ</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="actions">
                    <button className="btn-secondary" onClick={handleClose} disabled={isPurchasing}>
                        Hủy
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handlePurchase}
                        disabled={isPurchasing}
                    >
                        {isPurchasing ? (
                            <>
                                <i className="fa fa-spinner fa-spin"></i> Đang xử lý...
                            </>
                        ) : (
                            'Thanh toán'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;