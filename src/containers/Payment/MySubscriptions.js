import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { fetchUserSubscriptions, cancelSubscription } from '../../store/actions/paymentActions';
import Navbar from '../../components/Navbar';
import HomeFooter from '../HomePage/HomeFooter';
import './MySubscriptions.scss';

/**
 * My Subscriptions Page - Gói subscription đang sử dụng
 */
const MySubscriptions = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { subscriptions, loading, isLoggedIn } = useSelector(state => ({
    subscriptions: state.payment?.subscriptions || [],
    loading: state.payment?.loading,
    isLoggedIn: state.user?.isLoggedIn
  }));

  // Check login khi vào trang
  useEffect(() => {
    if (!isLoggedIn) {
      history.push('/login');
      return;
    }
  }, [isLoggedIn, history]);

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchUserSubscriptions());
    }
  }, [dispatch, isLoggedIn]);

  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const handleCancel = (subscriptionId) => {
    if (window.confirm('Bạn chắc chắn muốn hủy subscription này?')) {
      dispatch(cancelSubscription(subscriptionId));
    }
  };

  const getProgressPercentage = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    const total = end - start;
    const used = today - start;
    return Math.min(Math.max((used / total) * 100, 0), 100);
  };

  return (
    <div>
      <Navbar />
      <div className="my-subscriptions-container">
        <div className="subscriptions-header">
          <h1>📅 Gói subscription của tôi</h1>
          <p>Danh sách gói dữ liệu đang được sử dụng</p>
        </div>

        {loading ? 
          (<div className="loading-spinner">
            <div className="spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>)
        : subscriptions.length === 0 
          ? (<div className="empty-state">
            <div className="empty-icon">
              <i className="fas fa-inbox"></i>
            </div>
            <h3>Chưa có subscription</h3>
            <p>Bạn chưa đăng ký gói subscription nào. Hãy mua một gói để bắt đầu!</p>
            <a href="/datasets" className="button primary">
              <i className="fas fa-shopping-cart"></i> Mua subscription
            </a>
          </div>)
          : (<div className="subscriptions-grid">
            {subscriptions.map((sub) => {
              const daysLeft = getDaysRemaining(sub.endDate);
              const progress = getProgressPercentage(sub.startDate, sub.endDate);
              
              return (
                <div key={sub.id} className="subscription-card">
                  <div className="card-header">
                    <div className="header-left">
                      <h3>{sub.dataset?.name}</h3>
                      <p className="data-type">{sub.dataset?.data_type}</p>
                    </div>
                    <div className="badge-package">
                      {sub.packageType === 'standard' && <span className="badge badge-standard">📅 Thuê bao</span>}
                      {sub.packageType === 'premium' && <span className="badge badge-premium">🔌 API</span>}
                    </div>
                  </div>

                  <div className="card-body">
                    {/* Thời gian */}
                    <div className="info-section">
                      <div className="info-row">
                        <span className="label">Ngày bắt đầu:</span>
                        <span className="value">{new Date(sub.startDate).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Ngày hết hạn:</span>
                        <span className="value">{new Date(sub.endDate).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="progress-section">
                      <div className="progress-label">
                        <span>Thời hạn sử dụng</span>
                        <span className="days-left">
                          {daysLeft <= 0 ? '❌ Hết hạn' : `⏳ Còn ${daysLeft} ngày`}
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="progress-percentage">{progress.toFixed(0)}%</div>
                    </div>

                    {/* Auto Renew */}
                    <div className="auto-renew-section">
                      <div className="renew-status">
                        {sub.autoRenew ? (
                          <>
                            <i className="fas fa-check-circle"></i>
                            <span>Tự động gia hạn: <strong>Bật</strong></span>
                          </>
                        ) : (
                          <>
                            <i className="fas fa-times-circle"></i>
                            <span>Tự động gia hạn: <strong>Tắt</strong></span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Dataset Info */}
                    <div className="dataset-info">
                      <div className="info-item">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{sub.dataset?.region}</span>
                      </div>
                      <div className="info-item">
                        <i className="fas fa-tag"></i>
                        <span>{sub.dataset?.data_type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="card-footer">
                    <button className="btn btn-primary btn-block">
                      <i className="fas fa-download"></i> Truy cập dữ liệu
                    </button>
                    <button 
                      className="btn btn-secondary btn-block"
                      onClick={() => handleCancel(sub.id)}
                    >
                      <i className="fas fa-times"></i> Hủy subscription
                    </button>
                  </div>
                </div>
              );
            })}
          </div>)
        }
      </div>
      <HomeFooter />
    </div>
  );
};

export default MySubscriptions;
