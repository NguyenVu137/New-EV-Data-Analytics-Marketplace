import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import './ProviderPayout.scss';
import * as actions from '../../store/actions';
import { toast } from 'react-toastify';
import LoadingOverlay from 'react-loading-overlay';

class ProviderPayout extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 'balance',
            selectedPayouts: [],
            showWithdrawModal: false,
            bankInfo: {
                bankName: '',
                accountNumber: '',
                accountName: ''
            },
            filterStatus: 'all',
            isLoading: false
        };
    }

    async componentDidMount() {
        await this.loadData();
    }

    loadData = async () => {
        this.setState({ isLoading: true });
        try {
            await Promise.all([
                this.props.getBalance(),
                this.props.getMyPayouts()
            ]);
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Không thể tải dữ liệu');
        } finally {
            this.setState({ isLoading: false });
        }
    };

    handleTabChange = (tab) => {
        this.setState({ activeTab: tab });
    };

    handleSelectPayout = (payoutId) => {
        const { selectedPayouts } = this.state;
        if (selectedPayouts.includes(payoutId)) {
            this.setState({
                selectedPayouts: selectedPayouts.filter(id => id !== payoutId)
            });
        } else {
            this.setState({
                selectedPayouts: [...selectedPayouts, payoutId]
            });
        }
    };

    handleSelectAll = (payouts) => {
        const availablePayouts = payouts.filter(p => p.status === 'available');
        const allIds = availablePayouts.map(p => p.id);
        const { selectedPayouts } = this.state;

        if (selectedPayouts.length === allIds.length) {
            this.setState({ selectedPayouts: [] });
        } else {
            this.setState({ selectedPayouts: allIds });
        }
    };

    openWithdrawModal = () => {
        const { selectedPayouts } = this.state;
        if (selectedPayouts.length === 0) {
            toast.warning('Vui lòng chọn ít nhất một khoản thanh toán');
            return;
        }
        this.setState({ showWithdrawModal: true });
    };

    closeWithdrawModal = () => {
        this.setState({
            showWithdrawModal: false,
            bankInfo: {
                bankName: '',
                accountNumber: '',
                accountName: ''
            }
        });
    };

    handleBankInfoChange = (field, value) => {
        this.setState({
            bankInfo: {
                ...this.state.bankInfo,
                [field]: value
            }
        });
    };

    handleWithdraw = async () => {
        const { selectedPayouts, bankInfo } = this.state;

        if (!bankInfo.bankName || !bankInfo.accountNumber || !bankInfo.accountName) {
            toast.error('Vui lòng điền đầy đủ thông tin ngân hàng');
            return;
        }

        this.setState({ isLoading: true });

        try {
            console.log('selectedPayouts:', selectedPayouts);
            console.log('bankInfo:', bankInfo);
            const result = await this.props.requestWithdraw(selectedPayouts, bankInfo);

            if (result && result.success) {
                toast.success('Yêu cầu rút tiền thành công!');
                this.closeWithdrawModal();
                this.setState({ selectedPayouts: [] });
                await this.loadData();
            } else {
                toast.error(result.message || 'Không thể tạo yêu cầu rút tiền');
            }
        } catch (error) {
            toast.error('Lỗi khi tạo yêu cầu rút tiền');
        } finally {
            this.setState({ isLoading: false });
        }
    };

    getStatusBadge = (status) => {
        const statusMap = {
            available: { text: 'Có thể rút', class: 'success' },
            pending: { text: 'Chờ xử lý', class: 'warning' },
            completed: { text: 'Đã rút', class: 'secondary' },
            failed: { text: 'Thất bại', class: 'danger' }
        };

        const statusInfo = statusMap[status] || { text: status, class: 'secondary' };
        return (
            <span className={`badge badge-${statusInfo.class}`}>
                {statusInfo.text}
            </span>
        );
    };

    calculateSelectedTotal = () => {
        const { myPayouts } = this.props;
        const { selectedPayouts } = this.state;

        return myPayouts
            .filter(p => selectedPayouts.includes(p.id))
            .reduce((sum, p) => sum + (p.amount || 0), 0);
    };

    filterPayouts = () => {
        const { myPayouts } = this.props;
        const { filterStatus } = this.state;

        if (filterStatus === 'all') {
            return myPayouts || [];
        }

        // Map filterStatus to correct backend/frontend status
        if (filterStatus === 'all') {
            return myPayouts || [];
        }
        // Map filter value to backend status
        const statusMap = {
            pending: 'pending',
            available: 'available',
            completed: 'completed',
            failed: 'failed'
        };
        return (myPayouts || []).filter(p => p.status === statusMap[filterStatus]);
    };

    render() {
        const {
            balance,
            isLoadingBalance,
            isLoadingPayouts,
            isWithdrawing
        } = this.props;

        const {
            activeTab,
            selectedPayouts,
            showWithdrawModal,
            bankInfo,
            filterStatus,
            isLoading
        } = this.state;

        const filteredPayouts = this.filterPayouts();
        const selectedTotal = this.calculateSelectedTotal();

        return (
            <LoadingOverlay
                active={isLoading || isLoadingBalance || isLoadingPayouts || isWithdrawing}
                spinner
                text='Đang xử lý...'
            >
                <div className="provider-payout-container">
                    <div className="pp-header">
                        <h2 className="pp-title">
                            <i className="fas fa-money-bill-wave"></i>
                            Quản Lý Thu Nhập
                        </h2>
                        <p className="pp-subtitle">
                            Theo dõi doanh thu và quản lý việc rút tiền của bạn
                        </p>
                    </div>

                    {/* Balance Overview */}
                    <div className="balance-overview">
                        <div className="balance-card total">
                            <div className="card-icon">
                                <i className="fas fa-wallet"></i>
                            </div>
                            <div className="card-info">
                                <div className="card-label">Tổng doanh thu</div>
                                <div className="card-value">
                                    {(balance?.total || 0).toLocaleString()} VNĐ
                                </div>
                            </div>
                        </div>

                        <div className="balance-card available">
                            <div className="card-icon">
                                <i className="fas fa-hand-holding-usd"></i>
                            </div>
                            <div className="card-info">
                                <div className="card-label">Có thể rút</div>
                                <div className="card-value">
                                    {(balance?.available || 0).toLocaleString()} VNĐ
                                </div>
                            </div>
                        </div>

                        <div className="balance-card pending">
                            <div className="card-icon">
                                <i className="fas fa-clock"></i>
                            </div>
                            <div className="card-info">
                                <div className="card-label">Đang chờ</div>
                                <div className="card-value">
                                    {(balance?.pending || 0).toLocaleString()} VNĐ
                                </div>
                            </div>
                        </div>

                        <div className="balance-card completed">
                            <div className="card-icon">
                                <i className="fas fa-check-circle"></i>
                            </div>
                            <div className="card-info">
                                <div className="card-label">Đã rút</div>
                                <div className="card-value">
                                    {(balance?.completed || 0).toLocaleString()} VNĐ
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="pp-tabs">
                        <button
                            className={`tab ${activeTab === 'balance' ? 'active' : ''}`}
                            onClick={() => this.handleTabChange('balance')}
                        >
                            <i className="fas fa-list"></i>
                            Danh sách thanh toán
                        </button>
                        <button
                            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
                            onClick={() => this.handleTabChange('history')}
                        >
                            <i className="fas fa-history"></i>
                            Lịch sử rút tiền
                        </button>
                    </div>

                    {/* Content */}
                    <div className="pp-content">
                        {activeTab === 'balance' && (
                            <div className="payouts-section">
                                {/* Actions Bar */}
                                <div className="actions-bar">
                                    <div className="left-actions">
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => this.setState({ filterStatus: e.target.value })}
                                            className="filter-select"
                                        >
                                            <option value="all">Tất cả trạng thái</option>
                                            <option value="pending">Chờ xử lý</option>
                                            <option value="available">Có thể rút</option>
                                            <option value="completed">Đã rút</option>
                                            <option value="failed">Thất bại</option>
                                        </select>

                                        {selectedPayouts.length > 0 && (
                                            <div className="selected-info">
                                                Đã chọn: {selectedPayouts.length} khoản
                                                ({selectedTotal.toLocaleString()} VNĐ)
                                            </div>
                                        )}
                                    </div>

                                    <div className="right-actions">
                                        <button
                                            className="btn-refresh"
                                            onClick={this.loadData}
                                        >
                                            <i className="fas fa-sync-alt"></i>
                                            Làm mới
                                        </button>
                                        <button
                                            className="btn-withdraw"
                                            onClick={this.openWithdrawModal}
                                            disabled={selectedPayouts.length === 0}
                                        >
                                            <i className="fas fa-money-check-alt"></i>
                                            Rút tiền ({selectedPayouts.length})
                                        </button>
                                    </div>
                                </div>

                                {/* Payouts Table */}
                                <div className="payouts-table-wrapper">
                                    {filteredPayouts.length === 0 ? (
                                        <div className="empty-state">
                                            <i className="fas fa-inbox"></i>
                                            <p>Không có khoản thanh toán nào</p>
                                        </div>
                                    ) : (
                                        <table className="payouts-table">
                                            <thead>
                                                <tr>
                                                    <th>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedPayouts.length === filteredPayouts.filter(p => p.status === 'available').length && filteredPayouts.filter(p => p.status === 'available').length > 0}
                                                            onChange={() => this.handleSelectAll(filteredPayouts)}
                                                        />
                                                    </th>
                                                    <th>Dataset</th>
                                                    <th>Giao dịch</th>
                                                    <th>Số tiền</th>
                                                    <th>Hoa hồng</th>
                                                    <th>Trạng thái</th>
                                                    <th>Ngày</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredPayouts.map(payout => (
                                                    <tr key={payout.id}>
                                                        <td>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedPayouts.includes(payout.id)}
                                                                onChange={() => this.handleSelectPayout(payout.id)}
                                                                disabled={payout.status !== 'available'}
                                                            />
                                                        </td>
                                                        <td>
                                                            <div className="dataset-info">
                                                                <div className="dataset-name">
                                                                    {payout.Transaction?.Dataset?.name || 'N/A'}
                                                                </div>
                                                                <div className="dataset-category">
                                                                    {payout.Transaction?.Dataset?.category || ''}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>#{payout.transactionId}</td>
                                                        <td className="amount">
                                                            {(payout.amount || 0).toLocaleString()} VNĐ
                                                        </td>
                                                        <td className="commission">
                                                            {payout.commission || 0}%
                                                        </td>
                                                        <td>
                                                            {this.getStatusBadge(payout.status)}
                                                        </td>
                                                        <td>
                                                            {new Date(payout.createdAt).toLocaleDateString('vi-VN')}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="history-section">
                                <div className="history-placeholder">
                                    <i className="fas fa-history"></i>
                                    <p>Lịch sử rút tiền sẽ được hiển thị ở đây</p>
                                    <small>Tính năng đang được phát triển</small>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Withdraw Modal */}
                    {showWithdrawModal && (
                        <div className="withdraw-modal-overlay" onClick={this.closeWithdrawModal}>
                            <div className="withdraw-modal" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3>Yêu cầu rút tiền</h3>
                                    <button
                                        className="btn-close"
                                        onClick={this.closeWithdrawModal}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>

                                <div className="modal-body">
                                    <div className="withdraw-summary">
                                        <div className="summary-row">
                                            <span>Số khoản thanh toán:</span>
                                            <strong>{selectedPayouts.length}</strong>
                                        </div>
                                        <div className="summary-row total">
                                            <span>Tổng số tiền:</span>
                                            <strong>{selectedTotal.toLocaleString()} VNĐ</strong>
                                        </div>
                                    </div>

                                    <div className="bank-info-form">
                                        <h4>Thông tin ngân hàng</h4>

                                        <div className="form-group">
                                            <label>Tên ngân hàng *</label>
                                            <select
                                                value={bankInfo.bankName}
                                                onChange={(e) => this.handleBankInfoChange('bankName', e.target.value)}
                                            >
                                                <option value="">Chọn ngân hàng</option>
                                                <option value="Vietcombank">Vietcombank</option>
                                                <option value="VietinBank">VietinBank</option>
                                                <option value="BIDV">BIDV</option>
                                                <option value="Agribank">Agribank</option>
                                                <option value="Techcombank">Techcombank</option>
                                                <option value="MB Bank">MB Bank</option>
                                                <option value="ACB">ACB</option>
                                                <option value="VPBank">VPBank</option>
                                                <option value="TPBank">TPBank</option>
                                                <option value="Sacombank">Sacombank</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Số tài khoản *</label>
                                            <input
                                                type="text"
                                                placeholder="Nhập số tài khoản"
                                                value={bankInfo.accountNumber}
                                                onChange={(e) => this.handleBankInfoChange('accountNumber', e.target.value)}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Tên chủ tài khoản *</label>
                                            <input
                                                type="text"
                                                placeholder="Nhập tên chủ tài khoản"
                                                value={bankInfo.accountName}
                                                onChange={(e) => this.handleBankInfoChange('accountName', e.target.value)}
                                            />
                                        </div>

                                        <div className="info-note">
                                            <i className="fas fa-info-circle"></i>
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button
                                        className="btn-cancel"
                                        onClick={this.closeWithdrawModal}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        className="btn-confirm"
                                        onClick={this.handleWithdraw}
                                    >
                                        <i className="fas fa-check"></i>
                                        Xác nhận rút tiền
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </LoadingOverlay>
        );
    }
}

const mapStateToProps = state => {
    return {
        balance: state.payout.balance,
        myPayouts: state.payout.myPayouts,
        isLoadingBalance: state.payout.isLoadingBalance,
        isLoadingPayouts: state.payout.isLoadingPayouts,
        isWithdrawing: state.payout.isWithdrawing
    };
};

const mapDispatchToProps = dispatch => {
    return {
        getBalance: () => dispatch(actions.getBalance()),
        getMyPayouts: (status, limit, offset) =>
            dispatch(actions.getMyPayouts(status, limit, offset)),
        requestWithdraw: (payoutIds, bankInfo) =>
            dispatch(actions.requestWithdraw(payoutIds, bankInfo))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProviderPayout);
