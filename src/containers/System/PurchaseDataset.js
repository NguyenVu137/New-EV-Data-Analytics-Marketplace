import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import './PurchaseDataset.scss';
import * as actions from '../../store/actions';
import { toast } from 'react-toastify';
import LoadingOverlay from 'react-loading-overlay';

class PurchaseDataset extends Component {
    constructor(props) {
        super(props);
        this.state = {
            purchases: [],
            isLoading: false,
            selectedPackage: 'basic',
            showPaymentModal: false,
            showConfirmPayment: false,
            currentDataset: null,
            pendingTransaction: null,
            paymentMethod: 'vnpay',
            searchKeyword: '',
            filterStatus: 'all'
        };
    }

    async componentDidMount() {
        await this.loadUserPurchases();
    }

    loadUserPurchases = async () => {
        this.setState({ isLoading: true });
        try {
            const result = await this.props.getUserPurchases();
            if (result && result.success) {
                this.setState({
                    purchases: result.data || [],
                    isLoading: false
                });
            } else {
                this.setState({ isLoading: false });
                toast.error('Không thể tải danh sách mua hàng');
            }
        } catch (error) {
            this.setState({ isLoading: false });
            toast.error('Lỗi khi tải dữ liệu');
        }
    };

    handlePurchaseDataset = async (datasetId) => {
        console.log('=== handlePurchaseDataset CALLED ===');
        console.log('datasetId:', datasetId);
        
        const { selectedPackage, paymentMethod } = this.state;
        
        console.log('selectedPackage:', selectedPackage);
        console.log('paymentMethod:', paymentMethod);
        
        if (!datasetId) {
            toast.error('Vui lòng chọn dataset');
            return;
        }

        this.setState({ isLoading: true });

        try {
            console.log('Calling createTransaction...');
            const result = await this.props.createTransaction(
                datasetId,
                selectedPackage,
                paymentMethod
            );

            console.log('Purchase result:', result);
            console.log('Result errCode:', result?.errCode);
            console.log('Result transaction:', result?.transaction);

            if (result && result.errCode === 0) {
                toast.success('Tạo đơn hàng thành công!');
                
                console.log('Has paymentUrl?', result.paymentUrl);
                console.log('Transaction object:', result.transaction);
                
                // Nếu có paymentUrl (production) thì redirect
                if (result.paymentUrl) {
                    window.location.href = result.paymentUrl;
                } else {
                    // Dev mode: Hiện modal xác nhận thanh toán
                    console.log('Showing confirm payment modal...');
                    this.setState({ 
                        showPaymentModal: false,
                        showConfirmPayment: true,
                        pendingTransaction: result.transaction,
                        isLoading: false
                    });
                }
            } else {
                console.error('Purchase failed:', result);
                toast.error(result?.message || 'Không thể tạo đơn hàng');
                this.setState({ isLoading: false });
            }
        } catch (error) {
            console.error('Purchase error:', error);
            toast.error('Lỗi khi tạo đơn hàng');
            this.setState({ isLoading: false });
        } finally {
            this.setState({ isLoading: false });
        }
    };

    handleCheckPermission = async (datasetId) => {
        try {
            const result = await this.props.checkDownloadPermission(datasetId);
            if (result && result.success) {
                if (result.data.canDownload) {
                    toast.success('Bạn có quyền tải dataset này');
                    // Có thể trigger download ở đây
                } else {
                    toast.warning('Bạn chưa mua dataset này');
                }
            }
        } catch (error) {
            toast.error('Không thể kiểm tra quyền tải');
        }
    };

    confirmPayment = async () => {
        const { pendingTransaction } = this.state;
        
        if (!pendingTransaction) {
            toast.error('Không tìm thấy giao dịch');
            return;
        }

        this.setState({ isLoading: true });

        try {
            // Gọi API simulate payment để hoàn tất thanh toán
            const result = await this.props.simulatePayment(pendingTransaction.id, 'success');

            if (result && result.errCode === 0) {
                toast.success('Thanh toán thành công!');
                await this.loadUserPurchases();
                this.setState({ 
                    showConfirmPayment: false,
                    pendingTransaction: null,
                    isLoading: false
                });
            } else {
                toast.error('Thanh toán thất bại');
                this.setState({ isLoading: false });
            }
        } catch (error) {
            console.error('Confirm payment error:', error);
            toast.error('Lỗi khi thanh toán');
            this.setState({ isLoading: false });
        }
    };

    cancelPayment = () => {
        this.setState({ 
            showConfirmPayment: false,
            pendingTransaction: null
        });
        toast.info('Đã hủy thanh toán');
    };

    handleSimulatePayment = async (transactionId) => {
        if (!transactionId) return;

        try {
            const result = await this.props.simulatePayment(transactionId, 'success');
            if (result && result.success) {
                toast.success('Thanh toán thành công (DEV MODE)');
                await this.loadUserPurchases();
            } else {
                toast.error('Thanh toán thất bại');
            }
        } catch (error) {
            toast.error('Lỗi khi simulate payment');
        }
    };

    openPaymentModal = (dataset) => {
        console.log('Opening payment modal with dataset:', dataset);
        console.log('Dataset ID:', dataset?.id);
        this.setState({
            showPaymentModal: true,
            currentDataset: dataset
        });
    };

    closePaymentModal = () => {
        this.setState({
            showPaymentModal: false,
            currentDataset: null,
            selectedPackage: 'basic',
            paymentMethod: 'vnpay'
        });
    };

    handlePackageChange = (packageType) => {
        this.setState({ selectedPackage: packageType });
    };

    handlePaymentMethodChange = (method) => {
        this.setState({ paymentMethod: method });
    };

    getStatusBadge = (status) => {
        const statusMap = {
            pending: { text: 'Chờ thanh toán', class: 'warning' },
            success: { text: 'Thành công', class: 'success' },
            failed: { text: 'Thất bại', class: 'danger' },
            cancelled: { text: 'Đã hủy', class: 'secondary' }
        };

        const statusInfo = statusMap[status] || { text: status, class: 'info' };
        return (
            <span className={`badge badge-${statusInfo.class}`}>
                {statusInfo.text}
            </span>
        );
    };

    getPackagePrice = (packageType) => {
        const prices = {
            basic: '100,000',
            standard: '500,000',
            premium: '1,000,000'
        };
        return prices[packageType] || '0';
    };

    filterPurchases = () => {
        const { purchases, searchKeyword, filterStatus } = this.state;
        
        return purchases.filter(purchase => {
            const matchSearch = !searchKeyword || 
                purchase.Dataset?.name?.toLowerCase().includes(searchKeyword.toLowerCase());
            
            const matchStatus = filterStatus === 'all' || 
                purchase.Transaction?.status === filterStatus;
            
            return matchSearch && matchStatus;
        });
    };

    render() {
        const { 
            isLoading, 
            showPaymentModal,
            showConfirmPayment, 
            currentDataset,
            pendingTransaction, 
            selectedPackage,
            paymentMethod,
            searchKeyword,
            filterStatus
        } = this.state;

        const filteredPurchases = this.filterPurchases();

        return (
            <LoadingOverlay active={isLoading} spinner text='Đang xử lý...'>
                <div className="purchase-dataset-container">
                    <div className="pd-header">
                        <h2 className="pd-title">
                            <i className="fas fa-shopping-cart"></i>
                            Quản Lý Mua Dataset
                        </h2>
                        <p className="pd-subtitle">
                            Danh sách các dataset bạn đã mua và lịch sử giao dịch
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="pd-filters">
                        <div className="filter-search">
                            <i className="fas fa-search"></i>
                            <input
                                type="text"
                                placeholder="Tìm kiếm dataset..."
                                value={searchKeyword}
                                onChange={(e) => this.setState({ searchKeyword: e.target.value })}
                            />
                        </div>
                        <div className="filter-status">
                            <select
                                value={filterStatus}
                                onChange={(e) => this.setState({ filterStatus: e.target.value })}
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="pending">Chờ thanh toán</option>
                                <option value="success">Thành công</option>
                                <option value="failed">Thất bại</option>
                                <option value="cancelled">Đã hủy</option>
                            </select>
                        </div>
                        <button 
                            className="btn-refresh"
                            onClick={this.loadUserPurchases}
                        >
                            <i className="fas fa-sync-alt"></i>
                            Làm mới
                        </button>
                    </div>

                    {/* Purchases List */}
                    <div className="pd-content">
                        {filteredPurchases.length === 0 ? (
                            <div className="pd-empty">
                                <i className="fas fa-inbox"></i>
                                <p>Bạn chưa mua dataset nào</p>
                                <button 
                                    className="btn-browse"
                                    onClick={() => this.props.history.push('/datasets')}
                                >
                                    Khám phá Dataset
                                </button>
                            </div>
                        ) : (
                            <div className="purchases-grid">
                                {filteredPurchases.map((purchase, index) => (
                                    <div key={index} className="purchase-card">
                                        <div className="card-header">
                                            <div className="dataset-info">
                                                <h3>{purchase.Dataset?.name || 'N/A'}</h3>
                                                <p className="category">
                                                    {purchase.Dataset?.category || 'Không rõ'}
                                                </p>
                                            </div>
                                            {this.getStatusBadge(purchase.Transaction?.status)}
                                        </div>

                                        <div className="card-body">
                                            <div className="info-row">
                                                <span className="label">Gói:</span>
                                                <span className="value package">
                                                    {purchase.packageType?.toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="info-row">
                                                <span className="label">Giá:</span>
                                                <span className="value price">
                                                    {purchase.Transaction?.amount?.toLocaleString()} VNĐ
                                                </span>
                                            </div>
                                            <div className="info-row">
                                                <span className="label">Ngày mua:</span>
                                                <span className="value">
                                                    {new Date(purchase.purchaseDate).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                            <div className="info-row">
                                                <span className="label">Phương thức:</span>
                                                <span className="value">
                                                    {purchase.Transaction?.paymentMethod || 'N/A'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="card-footer">
                                            {purchase.Transaction?.status === 'success' ? (
                                                <button 
                                                    className="btn-download"
                                                    onClick={() => this.handleCheckPermission(purchase.datasetId)}
                                                >
                                                    <i className="fas fa-download"></i>
                                                    Tải xuống
                                                </button>
                                            ) : purchase.Transaction?.status === 'pending' ? (
                                                <>
                                                    <button 
                                                        className="btn-pay"
                                                        onClick={() => this.handleSimulatePayment(purchase.transactionId)}
                                                    >
                                                        <i className="fas fa-credit-card"></i>
                                                        Thanh toán ngay
                                                    </button>
                                                    <button className="btn-cancel">
                                                        <i className="fas fa-times"></i>
                                                        Hủy
                                                    </button>
                                                </>
                                            ) : (
                                                <button 
                                                    className="btn-retry"
                                                    onClick={() => this.openPaymentModal(purchase.Dataset)}
                                                >
                                                    <i className="fas fa-redo"></i>
                                                    Mua lại
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Payment Modal */}
                    {showPaymentModal && currentDataset && (
                        <div className="payment-modal-overlay" onClick={this.closePaymentModal}>
                            <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3>Chọn gói và thanh toán</h3>
                                    <button 
                                        className="btn-close"
                                        onClick={this.closePaymentModal}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>

                                <div className="modal-body">
                                    <div className="dataset-summary">
                                        <h4>{currentDataset.name}</h4>
                                        <p>{currentDataset.description}</p>
                                    </div>

                                    {/* Package Selection */}
                                    <div className="package-selection">
                                        <h5>Chọn gói dữ liệu:</h5>
                                        <div className="package-options">
                                            {['basic', 'standard', 'premium'].map(pkg => (
                                                <div 
                                                    key={pkg}
                                                    className={`package-option ${selectedPackage === pkg ? 'active' : ''}`}
                                                    onClick={() => this.handlePackageChange(pkg)}
                                                >
                                                    <div className="package-name">{pkg.toUpperCase()}</div>
                                                    <div className="package-price">
                                                        {this.getPackagePrice(pkg)} VNĐ
                                                    </div>
                                                    <div className="package-features">
                                                        {pkg === 'basic' && '• Dữ liệu cơ bản'}
                                                        {pkg === 'standard' && '• Dữ liệu đầy đủ'}
                                                        {pkg === 'premium' && '• Dữ liệu premium + hỗ trợ'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Payment Method */}
                                    <div className="payment-method">
                                        <h5>Phương thức thanh toán:</h5>
                                        <div className="method-options">
                                            <label className={paymentMethod === 'vnpay' ? 'active' : ''}>
                                                <input
                                                    type="radio"
                                                    value="vnpay"
                                                    checked={paymentMethod === 'vnpay'}
                                                    onChange={(e) => this.handlePaymentMethodChange(e.target.value)}
                                                />
                                                <span>VNPay</span>
                                            </label>
                                            <label className={paymentMethod === 'momo' ? 'active' : ''}>
                                                <input
                                                    type="radio"
                                                    value="momo"
                                                    checked={paymentMethod === 'momo'}
                                                    onChange={(e) => this.handlePaymentMethodChange(e.target.value)}
                                                />
                                                <span>MoMo</span>
                                            </label>
                                            <label className={paymentMethod === 'bank' ? 'active' : ''}>
                                                <input
                                                    type="radio"
                                                    value="bank"
                                                    checked={paymentMethod === 'bank'}
                                                    onChange={(e) => this.handlePaymentMethodChange(e.target.value)}
                                                />
                                                <span>Chuyển khoản</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button 
                                        className="btn-cancel"
                                        onClick={this.closePaymentModal}
                                    >
                                        Hủy
                                    </button>
                                    <button 
                                        className="btn-confirm"
                                        onClick={() => {
                                            console.log('Button clicked! Dataset ID:', currentDataset?.id);
                                            this.handlePurchaseDataset(currentDataset.id);
                                        }}
                                    >
                                        <i className="fas fa-check"></i>
                                        Xác nhận thanh toán
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Confirm Payment Modal */}
                {showConfirmPayment && pendingTransaction && (
                    <div className="payment-modal-overlay">
                        <div className="payment-modal confirm-payment-modal">
                            <div className="modal-header">
                                <h3><i className="fas fa-credit-card"></i> Xác nhận thanh toán</h3>
                            </div>

                            <div className="modal-body">
                                <div className="payment-info">
                                    <h4>Thông tin đơn hàng</h4>
                                    <div className="info-row">
                                        <span className="label">Dataset:</span>
                                        <span className="value">{currentDataset?.name || 'N/A'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Gói:</span>
                                        <span className="value">{selectedPackage.toUpperCase()}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Số tiền:</span>
                                        <span className="value price">{pendingTransaction.amount?.toLocaleString()} VNĐ</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Phương thức:</span>
                                        <span className="value">{paymentMethod.toUpperCase()}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Mã giao dịch:</span>
                                        <span className="value code">{pendingTransaction.id}</span>
                                    </div>
                                </div>

                                <div className="payment-note">
                                    <i className="fas fa-info-circle"></i>
                                    <p>Vui lòng xác nhận thanh toán để hoàn tất giao dịch. Sau khi thanh toán thành công, bạn có thể tải xuống dataset ngay lập tức.</p>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button 
                                    className="btn-cancel"
                                    onClick={this.cancelPayment}
                                    disabled={isLoading}
                                >
                                    <i className="fas fa-times"></i> Hủy
                                </button>
                                <button 
                                    className="btn-confirm"
                                    onClick={this.confirmPayment}
                                    disabled={isLoading}
                                >
                                    <i className="fas fa-check"></i> Xác nhận thanh toán
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </LoadingOverlay>
        );
    }
}

const mapStateToProps = state => {
    return {
        userPurchases: state.transaction.userPurchases,
        isLoadingPurchases: state.transaction.isLoadingPurchases
    };
};

const mapDispatchToProps = dispatch => {
    return {
        getUserPurchases: () => dispatch(actions.getUserPurchases()),
        createTransaction: (datasetId, packageType, paymentMethod) => 
            dispatch(actions.createTransaction(datasetId, packageType, paymentMethod)),
        checkDownloadPermission: (datasetId) => 
            dispatch(actions.checkDownloadPermission(datasetId)),
        simulatePayment: (transactionId, status) => 
            dispatch(actions.simulatePayment(transactionId, status))
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PurchaseDataset));
