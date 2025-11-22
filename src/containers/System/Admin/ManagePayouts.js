import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import './ManagePayouts.scss';
import * as actions from '../../../store/actions';
import { toast } from 'react-toastify';
import axios from '../../../axios';
import { LANGUAGES } from '../../../utils';
import moment from 'moment';
import { NumericFormat } from 'react-number-format';

class ManagePayouts extends Component {
    constructor(props) {
        super(props);
        this.state = {
            payouts: [],
            statistics: null,
            loading: false,
            selectedPayout: null,
            showModal: false,
            action: '', // 'approve' or 'reject'
            note: '',
            filterStatus: 'PENDING' // Default to PENDING
        };
    }

    componentDidMount() {
        console.log('ManagePayouts mounted - props:', this.props);
        console.log('ManagePayouts userInfo:', this.props.userInfo);
        this.fetchPayouts();
        this.fetchStatistics();
    }

    fetchPayouts = async () => {
        try {
            console.log('Fetching payouts...');
            this.setState({ loading: true });
            const { filterStatus } = this.state;

            let url = '/api/transactions/payouts/pending';
            if (filterStatus && filterStatus !== 'PENDING') {
                url = `/api/transactions/payouts?status=${filterStatus}`;
            }

            console.log('Calling API:', url);
            const data = await axios.get(url);
            console.log('Payouts response:', data);

            let payoutsData = [];
            if (data.errCode === 0) {
                payoutsData = data.data || [];
            } else if (Array.isArray(data)) {
                payoutsData = data;
            }

            this.setState({
                payouts: payoutsData,
                loading: false
            });
        } catch (error) {
            console.error('Fetch payouts error:', error);
            toast.error('Không thể tải danh sách payout');
            this.setState({ loading: false });
        }
    };

    fetchStatistics = async () => {
        try {
            const data = await axios.get('/api/transactions/payouts/statistics');
            if (data.errCode === 0) {
                this.setState({ statistics: data.data });
            }
        } catch (error) {
            console.error('Fetch statistics error:', error);
        }
    };

    handleProcessPayout = (payout, action) => {
        this.setState({
            selectedPayout: payout,
            action: action,
            showModal: true,
            note: ''
        });
    };

    confirmProcess = async () => {
        try {
            const { selectedPayout, action, note } = this.state;

            const data = await axios.post(`/api/transactions/payouts/${selectedPayout.id}/process`, {
                action: action,
                admin_note: note
            });

            if (data.errCode === 0) {
                toast.success(
                    action === 'approve'
                        ? 'Đã duyệt payout thành công'
                        : 'Đã từ chối payout'
                );

                this.setState({ showModal: false, selectedPayout: null, note: '' });
                this.fetchPayouts();
                this.fetchStatistics();
            } else {
                toast.error(data.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Process payout error:', error);
            toast.error(error.response?.data?.message || 'Lỗi khi xử lý payout');
        }
    };

    closeModal = () => {
        this.setState({
            showModal: false,
            selectedPayout: null,
            note: '',
            action: ''
        });
    };

    handleFilterChange = (e) => {
        this.setState({ filterStatus: e.target.value }, () => {
            this.fetchPayouts();
        });
    };

    getStatusBadge = (status) => {
        const statusMap = {
            'PENDING': { class: 'warning', text: 'Chờ duyệt' },
            'APPROVED': { class: 'info', text: 'Đã duyệt' },
            'COMPLETED': { class: 'success', text: 'Đã hoàn thành' },
            'REJECTED': { class: 'danger', text: 'Đã từ chối' },
            'CANCELLED': { class: 'secondary', text: 'Đã hủy' }
        };

        const statusInfo = statusMap[status] || { class: 'secondary', text: status };
        return <span className={`badge badge-${statusInfo.class}`}>{statusInfo.text}</span>;
    };

    render() {
        const { payouts, statistics, loading, showModal, selectedPayout, action, note, filterStatus } = this.state;
        const { language } = this.props;

        return (
            <div className="manage-payouts-container">
                <div className="title">
                    <FormattedMessage id="admin.manage-payouts.title" defaultMessage="Quản lý thanh toán Provider" />
                </div>

                {/* Statistics Cards */}
                {statistics && (
                    <div className="statistics-section">
                        <div className="stat-card total">
                            <div className="stat-icon">
                                <i className="fas fa-check-circle"></i>
                            </div>
                            <div className="stat-info">
                                <div className="stat-label">Tổng đã duyệt</div>
                                <div className="stat-value">
                                    <NumericFormat
                                        value={statistics.totalApproved || 0}
                                        displayType="text"
                                        thousandSeparator=","
                                        suffix=" VND"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="stat-card platform">
                            <div className="stat-icon">
                                <i className="fas fa-clock"></i>
                            </div>
                            <div className="stat-info">
                                <div className="stat-label">Tổng chờ duyệt</div>
                                <div className="stat-value">
                                    <NumericFormat
                                        value={statistics.totalPending || 0}
                                        displayType="text"
                                        thousandSeparator=","
                                        suffix=" VND"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="stat-card payment">
                            <div className="stat-icon">
                                <i className="fas fa-times-circle"></i>
                            </div>
                            <div className="stat-info">
                                <div className="stat-label">Tổng đã từ chối</div>
                                <div className="stat-value">
                                    {statistics.totalRejected || 0} yêu cầu
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="filters-section">
                    <div className="filter-group">
                        <label>Trạng thái:</label>
                        <select value={filterStatus} onChange={this.handleFilterChange}>
                            <option value="">Tất cả</option>
                            <option value="PENDING">Chờ duyệt</option>
                            <option value="APPROVED">Đã duyệt</option>
                            <option value="COMPLETED">Đã hoàn thành</option>
                            <option value="REJECTED">Đã từ chối</option>
                        </select>
                    </div>
                    <button className="btn-refresh" onClick={this.fetchPayouts}>
                        <i className="fas fa-sync-alt"></i> Làm mới
                    </button>
                </div>

                {/* Payouts Table */}
                <div className="payouts-table-container">
                    {loading ? (
                        <div className="loading">
                            <i className="fas fa-spinner fa-spin"></i> Đang tải...
                        </div>
                    ) : payouts.length === 0 ? (
                        <div className="no-data">
                            <i className="fas fa-inbox"></i>
                            <p>Không có yêu cầu payout nào</p>
                        </div>
                    ) : (
                        <table className="payouts-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Provider ID</th>
                                    <th>Số tiền</th>
                                    <th>Thông tin NH</th>
                                    <th>Trạng thái</th>
                                    <th>Ngày tạo</th>
                                    <th>Ghi chú</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payouts.map((payout, index) => (
                                    <tr key={index}>
                                        <td>#{payout.id}</td>
                                        <td>{payout.provider_id}</td>
                                        <td>
                                            <div className="amount-breakdown">
                                                <div className="net-amount">
                                                    <strong>
                                                        <NumericFormat
                                                            value={payout.amount || 0}
                                                            displayType="text"
                                                            thousandSeparator=","
                                                            suffix=" VND"
                                                        />
                                                    </strong>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {payout.bank_name && payout.account_number ? (
                                                <div className="bank-info">
                                                    <strong>{payout.bank_name}</strong>
                                                    <small>{payout.account_number}</small>
                                                    <small>{payout.account_holder}</small>
                                                </div>
                                            ) : (
                                                <span className="text-muted">Chưa có</span>
                                            )}
                                        </td>
                                        <td>
                                            {this.getStatusBadge(payout.status)}
                                        </td>
                                        <td>
                                            {moment(payout.createdAt || payout.created_at).format('DD/MM/YYYY HH:mm')}
                                        </td>
                                        <td>
                                            <div className="note-cell">
                                                {payout.note || payout.admin_note || '-'}
                                            </div>
                                        </td>
                                        <td>
                                            {payout.status === 'PENDING' && (
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn-approve"
                                                        onClick={() => this.handleProcessPayout(payout, 'approve')}
                                                        title="Duyệt"
                                                    >
                                                        <i className="fas fa-check"></i>
                                                    </button>
                                                    <button
                                                        className="btn-reject"
                                                        onClick={() => this.handleProcessPayout(payout, 'reject')}
                                                        title="Từ chối"
                                                    >
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                </div>
                                            )}
                                            {(payout.status !== 'PENDING') && (
                                                <span className="text-muted">Đã xử lý</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Process Modal */}
                {showModal && selectedPayout && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>
                                    {action === 'approve' ? 'Duyệt yêu cầu rút tiền' : 'Từ chối yêu cầu rút tiền'}
                                </h3>
                                <button className="close-btn" onClick={this.closeModal}>
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>

                            <div className="modal-body">
                                <div className="payout-details">
                                    <div className="detail-row">
                                        <span className="label">Provider ID:</span>
                                        <span className="value">{selectedPayout.provider_id}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Số tiền:</span>
                                        <span className="value highlight">
                                            <NumericFormat
                                                value={selectedPayout.amount || 0}
                                                displayType="text"
                                                thousandSeparator=","
                                                suffix=" VND"
                                            />
                                        </span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Ngân hàng:</span>
                                        <span className="value">{selectedPayout.bank_name}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Số tài khoản:</span>
                                        <span className="value">{selectedPayout.account_number}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Chủ tài khoản:</span>
                                        <span className="value">{selectedPayout.account_holder}</span>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>{action === 'approve' ? 'Ghi chú (tùy chọn):' : 'Lý do từ chối:'}</label>
                                    <textarea
                                        className="form-control"
                                        rows="4"
                                        value={note}
                                        onChange={(e) => this.setState({ note: e.target.value })}
                                        placeholder={
                                            action === 'approve'
                                                ? 'Nhập ghi chú về giao dịch...'
                                                : 'Nhập lý do từ chối yêu cầu rút tiền...'
                                        }
                                        required={action === 'reject'}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button className="btn-cancel" onClick={this.closeModal}>
                                    Hủy
                                </button>
                                <button
                                    className={action === 'approve' ? 'btn-confirm-approve' : 'btn-confirm-reject'}
                                    onClick={this.confirmProcess}
                                    disabled={action === 'reject' && !note.trim()}
                                >
                                    {action === 'approve' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        language: state.app.language,
        userInfo: state.user.userInfo
    };
};

const mapDispatchToProps = (dispatch) => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ManagePayouts);