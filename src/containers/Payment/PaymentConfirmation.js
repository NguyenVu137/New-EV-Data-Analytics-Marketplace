import React, { useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkPaymentStatus } from '../../store/actions/paymentActions';
import './PaymentConfirmation.scss';

/**
 * Payment Confirmation Page
 * Polling payment status từ server
 */
const PaymentConfirmation = () => {
  const { paymentId } = useParams();
  const history = useHistory();
  const dispatch = useDispatch();
  
  const { paymentStatus, loading } = useSelector(state => ({
    paymentStatus: state.payment?.paymentStatus,
    loading: state.payment?.loading
  }));

  // Polling payment status
  useEffect(() => {
    let interval = null;
    let count = 0;

    const poll = async () => {
      try {
        console.log('[PaymentConfirmation] Polling for payment status:', paymentId);
        const status = await dispatch(checkPaymentStatus(paymentId));
        
        console.log('[PaymentConfirmation] Poll result:', status);
        
        if (status && status.status !== 'pending') {
          // Thanh toán đã được xử lý - dừng polling, không tự động redirect
          console.log('[PaymentConfirmation] Payment status found:', status.status);
          if (interval) clearInterval(interval);
          // User sẽ click nút để chuyển hướng
        } else {
          console.log('[PaymentConfirmation] Payment still pending, continue polling');
          count++;
          
          // Ngừng polling sau 60 giây
          if (count > 30) {
            console.log('[PaymentConfirmation] Polling timeout');
            if (interval) clearInterval(interval);
          }
        }
      } catch (error) {
        console.error('[PaymentConfirmation] Polling error:', error);
      }
    };

    // Polling lần đầu
    poll();

    // Polling mỗi 2 giây
    interval = setInterval(poll, 2000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [paymentId, dispatch]);

  return (
    <div className="payment-confirmation">
      <div className="confirmation-container">
        {loading || !paymentStatus ? (
          <div className="confirmation-loading">
            <div className="spinner"></div>
            <h2>Đang xử lý thanh toán...</h2>
            <p>Vui lòng không đóng trang này</p>
            <div className="payment-details">
              <p>ID: {paymentId}</p>
              <p className="countdown">Đang kiểm tra trạng thái...</p>
            </div>
          </div>
        ) : paymentStatus.status === 'success' ? (
          <div className="confirmation-success">
            <div className="success-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h2>Thanh toán thành công! 🎉</h2>
            <div className="success-details">
              <div className="detail-row">
                <span>Giao dịch:</span>
                <strong>{paymentStatus.transactionId}</strong>
              </div>
              <div className="detail-row">
                <span>Số tiền:</span>
                <strong>₫{paymentStatus.amount?.toLocaleString('vi-VN')}</strong>
              </div>
              <div className="detail-row">
                <span>Dataset:</span>
                <strong>{paymentStatus.order?.datasetName}</strong>
              </div>
              <div className="detail-row">
                <span>Gói:</span>
                <strong>{paymentStatus.order?.packageType}</strong>
              </div>
            </div>
            <p className="success-message">Cảm ơn bạn đã mua dữ liệu. Bạn có thể tải dữ liệu ngay hoặc quay lại trang chủ.</p>
            <div className="success-actions">
              <button 
                className="button primary"
                onClick={() => history.push('/my-datasets')}
              >
                <i className="fas fa-download"></i> Xem lịch sử mua
              </button>
              <button 
                className="button secondary"
                onClick={() => history.push('/home')}
              >
                <i className="fas fa-home"></i> Quay lại trang chủ
              </button>
            </div>
          </div>
        ) : (
          <div className="confirmation-failed">
            <div className="failed-icon">
              <i className="fas fa-times-circle"></i>
            </div>
            <h2>Thanh toán thất bại</h2>
            <p className="error-message">Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại.</p>
            <div className="failed-actions">
              <button 
                className="button primary"
                onClick={() => window.location.reload()}
              >
                <i className="fas fa-redo"></i> Thử lại
              </button>
              <button 
                className="button secondary"
                onClick={() => history.push('/datasets')}
              >
                <i className="fas fa-arrow-left"></i> Quay lại danh sách
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentConfirmation;
