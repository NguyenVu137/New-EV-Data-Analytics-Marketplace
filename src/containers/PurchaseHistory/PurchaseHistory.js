import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { toast } from 'react-toastify';
import axiosInstance from '../../axios';
import Navbar from '../../components/Navbar';
import HomeFooter from '../HomePage/HomeFooter';
import './PurchaseHistory.scss';

class PurchaseHistory extends React.Component {
    constructor(props) {
        super(props);
        this._isMounted = true;
        this.state = {
            purchases: [],
            isLoading: true,
            error: null,
            cancelingId: null,
        };
    }

    componentDidMount() {
        // Check on mount, may be too early due to Redux persist rehydration
        if (this.props.isLoggedIn && this.props.userInfo?.user?.id) {
            this.fetchPurchaseHistory();
        }
    }

    componentDidUpdate(prevProps) {
        // Re-check when props change (Redux rehydration complete)
        if (this.props.isLoggedIn && this.props.userInfo?.user?.id) {
            // Only fetch if userId changed (i.e., after Redux rehydration)
            if (prevProps.userInfo?.user?.id !== this.props.userInfo?.user?.id) {
                this.fetchPurchaseHistory();
            }
        }
    }

    componentWillUnmount() {
        // Cleanup: prevent state updates on unmounted component
        this._isMounted = false;
    }

    fetchPurchaseHistory = async () => {
        try {
            this.setState({ isLoading: true, error: null });
            const userId = this.props.userInfo?.user?.id;
            
            if (!userId) {
                this.setState({
                    error: 'Vui lòng đăng nhập',
                    isLoading: false,
                });
                return;
            }
            
            console.log('[PurchaseHistory] Fetching subscriptions for userId:', userId);
            
            // Use axios instance with auth middleware
            // Pass userId as query param as backup for header
            const response = await axiosInstance.get(`/api/subscriptions?userId=${userId}`);
            
            console.log('[PurchaseHistory] Response:', response);

            if (!this._isMounted) return;

            if (response.success) {
                this.setState({
                    purchases: response.data || [],
                    isLoading: false,
                });
            } else {
                this.setState({
                    error: response.message || 'Failed to load purchase history',
                    isLoading: false,
                });
            }
        } catch (error) {
            if (!this._isMounted) return;
            
            console.error('[PurchaseHistory] Error fetching purchase history:', error);
            this.setState({
                error: error.response?.data?.message || 'Error loading purchase history',
                isLoading: false,
            });
        }
    };

    handleDownloadData = async (subscriptionId, datasetName) => {
        try {
            this.setState({ cancelingId: subscriptionId });
            const userId = this.props.userInfo?.user?.id;
            
            console.log('[PurchaseHistory] Downloading data for subscription:', subscriptionId, 'userId:', userId);
            
            const response = await axiosInstance.get(`/api/subscriptions/${subscriptionId}/download?userId=${userId}`, {
                responseType: 'blob'
            });
            
            if (!this._isMounted) return;
            
            // Create blob and download
            const url = window.URL.createObjectURL(new Blob([response]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${datasetName || 'dataset'}_${new Date().getTime()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            
            toast.success('Tải dữ liệu thành công!');
        } catch (error) {
            if (!this._isMounted) return;
            
            console.error('[PurchaseHistory] Error downloading data:', error);
            toast.error('Không thể tải dữ liệu');
        } finally {
            if (this._isMounted) {
                this.setState({ cancelingId: null });
            }
        }
    };

    canDownloadData = (packageType) => {
        // All packages can download data (basic, standard, premium)
        if (!packageType) return false;
        const type = packageType.toLowerCase();
        return type !== 'free' && type !== 'trial';
    };

    render() {
        const { purchases, isLoading, error, cancelingId } = this.state;

        if (!this.props.isLoggedIn) {
            return (
                <div className="purchase-history-wrapper">
                    <Navbar />
                    <div className="purchase-history-container">
                        <div className="alert alert-warning">
                            <FormattedMessage id="common.please-login" />
                        </div>
                    </div>
                    <HomeFooter />
                </div>
            );
        }

        if (isLoading) {
            return (
                <div className="purchase-history-wrapper">
                    <Navbar />
                    <div className="purchase-history-container">
                        <div className="text-center">
                            <p><FormattedMessage id="common.loading" /></p>
                        </div>
                    </div>
                    <HomeFooter />
                </div>
            );
        }

        if (error) {
            return (
                <div className="purchase-history-wrapper">
                    <Navbar />
                    <div className="purchase-history-container">
                        <div className="alert alert-danger">{error}</div>
                    </div>
                    <HomeFooter />
                </div>
            );
        }

        return (
            <div className="purchase-history-wrapper">
                <Navbar />
                <div className="purchase-history-container">
                    <div className="purchase-history-header">
                        <h2><FormattedMessage id="purchase-history.title" defaultMessage="Purchase History" /></h2>
                    </div>

                    {purchases.length === 0 ? (
                        <div className="empty-state">
                            <p><FormattedMessage id="purchase-history.no-purchases" defaultMessage="No purchases found" /></p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-bordered table-hover">
                                <thead>
                                    <tr>
                                        <th><FormattedMessage id="purchase-history.dataset-name" defaultMessage="Dataset Name" /></th>
                                        <th><FormattedMessage id="purchase-history.purchase-date" defaultMessage="Purchase Date" /></th>
                                        <th><FormattedMessage id="purchase-history.package-type" defaultMessage="Package Type" /></th>
                                        <th><FormattedMessage id="purchase-history.price" defaultMessage="Price" /></th>
                                        <th><FormattedMessage id="purchase-history.actions" defaultMessage="Actions" /></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {purchases.map((purchase) => (
                                        <tr key={purchase.id}>
                                            <td>{purchase.dataset?.name || 'N/A'}</td>
                                            <td>{purchase.startDate ? new Date(purchase.startDate).toLocaleDateString() : 'N/A'}</td>
                                            <td>
                                                <span className={`badge badge-${this.getPackageBadgeClass(purchase.packageType)}`}>
                                                    {purchase.packageType}
                                                </span>
                                            </td>
                                            <td>${purchase.order?.amount || '0'}</td>
                                            <td>
                                                {this.canDownloadData(purchase.packageType) ? (
                                                    <button
                                                        className="btn btn-sm btn-primary"
                                                        onClick={() => this.handleDownloadData(purchase.id, purchase.dataset?.name)}
                                                        disabled={cancelingId === purchase.id}
                                                    >
                                                        {cancelingId === purchase.id ? (
                                                            <span><FormattedMessage id="common.downloading" defaultMessage="Downloading..." /></span>
                                                        ) : (
                                                            <span><FormattedMessage id="purchase-history.download" defaultMessage="Download" /></span>
                                                        )}
                                                    </button>
                                                ) : (
                                                    <span className="text-muted"><FormattedMessage id="purchase-history.not-available" defaultMessage="Not available" /></span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                <HomeFooter />
            </div>
        );
    }

    getPackageBadgeClass = (packageType) => {
        if (!packageType) return 'secondary';
        const type = packageType.toLowerCase();
        switch (type) {
            case 'basic':
                return 'info';
            case 'standard':
                return 'warning';
            case 'premium':
                return 'danger';
            default:
                return 'secondary';
        }
    };
}

const mapStateToProps = (state) => {
    return {
        isLoggedIn: state.user.isLoggedIn,
        userInfo: state.user.userInfo,
    };
};

export default connect(mapStateToProps)(PurchaseHistory);
