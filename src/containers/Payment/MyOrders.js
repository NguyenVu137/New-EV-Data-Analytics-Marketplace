import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserOrders } from '../../store/actions/paymentActions';
import Navbar from '../../components/Navbar';
import HomeFooter from '../HomePage/HomeFooter';
import './MyOrders.scss';

/**
 * My Orders Page - Lịch sử mua hàng
 */
const MyOrders = () => {
  const dispatch = useDispatch();
  const { orders, loading, page, limit, totalPages } = useSelector(state => ({
    orders: state.payment?.orders || [],
    loading: state.payment?.loading,
    page: state.payment?.page || 1,
    limit: state.payment?.limit || 10,
    totalPages: state.payment?.totalPages || 0
  }));

  useEffect(() => {
    dispatch(fetchUserOrders(page, limit));
  }, [dispatch, page, limit]);

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { class: 'badge-pending', label: 'Chờ xử lý' },
      confirmed: { class: 'badge-confirmed', label: 'Đã xác nhận' },
      failed: { class: 'badge-failed', label: 'Thất bại' },
      cancelled: { class: 'badge-cancelled', label: 'Đã hủy' }
    };
    return statusMap[status] || statusMap.pending;
  };

  return (
    <div>
      <Navbar />
      <div className="my-orders-container">
        <div className="orders-header">
          <h1>📋 Lịch sử mua hàng</h1>
          <p>Danh sách các gói dữ liệu bạn đã mua</p>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="fas fa-shopping-bag"></i>
            </div>
            <h3>Chưa có đơn hàng</h3>
            <p>Bạn chưa mua bất kỳ gói dữ liệu nào. Hãy khám phá danh sách dữ liệu của chúng tôi!</p>
            <a href="/datasets" className="button primary">
              <i className="fas fa-store"></i> Xem danh sách dữ liệu
            </a>
          </div>
        ) : (
          <div className="orders-list">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Dataset</th>
                  <th>Gói</th>
                  <th>Giá</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const statusInfo = getStatusBadge(order.status);
                  return (
                    <tr key={order.id} className={`order-row status-${order.status}`}>
                      <td className="order-id">#{order.id}</td>
                      <td className="dataset-name">{order.dataset?.name}</td>
                      <td className="package-type">
                        <span className={`badge pkg-${order.packageType}`}>
                          {order.packageType === 'basic' && '📥 Một lần'}
                          {order.packageType === 'standard' && '📅 Thuê bao'}
                          {order.packageType === 'premium' && '🔌 API'}
                        </span>
                      </td>
                      <td className="amount">₫{order.amount?.toLocaleString('vi-VN')}</td>
                      <td className="status">
                        <span className={`badge ${statusInfo.class}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="date">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="actions">
                        <button className="btn-small btn-info" title="Chi tiết">
                          <i className="fas fa-eye"></i>
                        </button>
                        {order.status === 'confirmed' && (
                          <button className="btn-small btn-download" title="Tải xuống">
                            <i className="fas fa-download"></i>
                          </button>
                        )}
                        {order.status === 'failed' && (
                          <button className="btn-small btn-retry" title="Thử lại">
                            <i className="fas fa-redo"></i>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  disabled={page === 1}
                  onClick={() => dispatch(fetchUserOrders(page - 1, limit))}
                  className="pagination-btn"
                >
                  ← Trước
                </button>
                <span className="pagination-info">
                  Trang {page} / {totalPages}
                </span>
                <button 
                  disabled={page === totalPages}
                  onClick={() => dispatch(fetchUserOrders(page + 1, limit))}
                  className="pagination-btn"
                >
                  Sau →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <HomeFooter />
    </div>
  );
};

export default MyOrders;
