import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import * as actions from '../../../store/actions';
import AIInsightsPanel from './AIInsightsPanel';
import './MarketAnalyticsDashboard.scss';

class MarketAnalyticsDashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedTab: 'ai-insights' // 👈 DEFAULT TAB = AI Insights
        };
    }

    componentDidMount() {
        this.props.fetchMarketAnalytics();
    }

    formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount || 0);
    };

    formatNumber = (num) => {
        return new Intl.NumberFormat('vi-VN').format(num || 0);
    };

    handleTabChange = (tab) => {
        this.setState({ selectedTab: tab });
    };

    renderOverviewCards = () => {
        const { marketOverview } = this.props.marketAnalytics || {};

        if (!marketOverview) return null;

        const cards = [
            {
                title: 'Tổng số Dataset',
                value: this.formatNumber(marketOverview.totalDatasets),
                icon: '📊',
                color: '#4a90e2'
            },
            {
                title: 'Tổng giao dịch',
                value: this.formatNumber(marketOverview.totalTransactions),
                icon: '💳',
                color: '#50c878'
            },
            {
                title: 'Tổng doanh thu',
                value: this.formatCurrency(marketOverview.totalRevenue),
                icon: '💰',
                color: '#f5a623'
            },
            {
                title: 'Lượt tải xuống',
                value: this.formatNumber(marketOverview.totalDownloads),
                icon: '⬇️',
                color: '#bd10e0'
            },
            {
                title: 'Subscription Active',
                value: this.formatNumber(marketOverview.activeSubscriptions),
                icon: '⭐',
                color: '#e74c3c'
            }
        ];

        return (
            <div className="overview-cards">
                {cards.map((card, index) => (
                    <div
                        key={index}
                        className="stat-card"
                        style={{ borderLeft: `4px solid ${card.color}` }}
                    >
                        <div className="card-icon" style={{ color: card.color }}>
                            {card.icon}
                        </div>
                        <div className="card-content">
                            <h3 className="card-title">{card.title}</h3>
                            <p className="card-value">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    renderTopDatasets = () => {
        const { topDatasets } = this.props.marketAnalytics || {};

        if (!topDatasets || topDatasets.length === 0) {
            return <p className="no-data">Không có dữ liệu</p>;
        }

        return (
            <div className="top-datasets-section">
                <h2 className="section-title">🏆 Top Datasets được quan tâm nhất</h2>
                <div className="table-container">
                    <table className="analytics-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Tên Dataset</th>
                                <th>Category</th>
                                <th>Provider</th>
                                <th>Lượt mua</th>
                                <th>Lượt tải</th>
                                <th>Subscription</th>
                                <th>Doanh thu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topDatasets.map((dataset, index) => (
                                <tr key={dataset.id}>
                                    <td>{index + 1}</td>
                                    <td className="dataset-title">{dataset.title}</td>
                                    <td>
                                        {dataset.category?.valueVi ||
                                            dataset.category?.valueEn ||
                                            'N/A'}
                                    </td>
                                    <td>
                                        {dataset.provider ?
                                            `${dataset.provider.firstName} ${dataset.provider.lastName}`
                                            : 'N/A'}
                                    </td>
                                    <td className="text-center">
                                        <span className="badge badge-primary">
                                            {this.formatNumber(dataset.purchaseCount)}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <span className="badge badge-info">
                                            {this.formatNumber(dataset.downloadCount)}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <span className="badge badge-success">
                                            {this.formatNumber(dataset.activeSubscriptions)}
                                        </span>
                                    </td>
                                    <td className="text-right revenue">
                                        {this.formatCurrency(dataset.totalRevenue)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    renderCategoryStats = () => {
        const { categoryStats } = this.props.marketAnalytics || {};

        if (!categoryStats || categoryStats.length === 0) {
            return <p className="no-data">Không có dữ liệu</p>;
        }

        return (
            <div className="category-stats-section">
                <h2 className="section-title">📂 Thống kê theo Category</h2>
                <div className="stats-grid">
                    {categoryStats.map((stat, index) => (
                        <div key={index} className="category-card">
                            <h3 className="category-name">
                                {stat.category?.valueVi || stat.category?.valueEn || 'Unknown'}
                            </h3>
                            <div className="category-metrics">
                                <div className="metric">
                                    <span className="metric-label">Số Dataset:</span>
                                    <span className="metric-value">
                                        {this.formatNumber(stat.datasetCount)}
                                    </span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">Lượt mua:</span>
                                    <span className="metric-value">
                                        {this.formatNumber(stat.totalPurchases)}
                                    </span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">Doanh thu:</span>
                                    <span className="metric-value revenue">
                                        {this.formatCurrency(stat.totalRevenue)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    renderPackageStats = () => {
        const { packageStats } = this.props.marketAnalytics || {};
        const { language } = this.props;

        if (!packageStats || packageStats.length === 0) {
            return <p className="no-data">Không có dữ liệu</p>;
        }

        const packageColors = {
            'PK1': '#4a90e2',  // Basic
            'PK2': '#f5a623',  // Standard
            'PK3': '#bd10e0'   // Premium
        };

        return (
            <div className="package-stats-section">
                <h2 className="section-title">📦 Thống kê theo gói</h2>
                <div className="package-cards">
                    {packageStats.map((stat, index) => (
                        <div
                            key={index}
                            className="package-card"
                            style={{
                                borderTop: `4px solid ${packageColors[stat.package_type_code] || '#ccc'}`
                            }}
                        >
                            <h3 className="package-name">
                                {language === 'vi'
                                    ? stat.package_type?.valueVi
                                    : stat.package_type?.valueEn}
                            </h3>
                            <div className="package-metrics">
                                <div className="big-metric">
                                    <span className="big-number">
                                        {this.formatNumber(stat.count)}
                                    </span>
                                    <span className="big-label">Lượt mua</span>
                                </div>
                                <div className="revenue-metric">
                                    <span className="revenue-amount">
                                        {this.formatCurrency(stat.totalRevenue)}
                                    </span>
                                    <span className="revenue-label">Doanh thu</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    render() {
        const { isLoadingAnalytics, marketAnalytics, analyticsError } = this.props;
        const { selectedTab } = this.state;

        if (isLoadingAnalytics) {
            return (
                <div className="market-analytics-dashboard">
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Đang tải thống kê...</p>
                    </div>
                </div>
            );
        }

        if (analyticsError) {
            return (
                <div className="market-analytics-dashboard">
                    <div className="error-container">
                        <p className="error-message">❌ {analyticsError}</p>
                        <button
                            className="btn-retry"
                            onClick={() => this.props.fetchMarketAnalytics()}
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            );
        }

        if (!marketAnalytics) {
            return (
                <div className="market-analytics-dashboard">
                    <p className="no-data">Không có dữ liệu thống kê</p>
                </div>
            );
        }

        return (
            <div className="market-analytics-dashboard">
                <div className="dashboard-header">
                    <h1 className="dashboard-title">
                        📈 Thống kê thị trường dữ liệu
                    </h1>
                    <p className="dashboard-subtitle">
                    </p>
                </div>

                <div className="dashboard-tabs">
                    <button
                        className={`tab-btn ${selectedTab === 'overview' ? 'active' : ''}`}
                        onClick={() => this.handleTabChange('overview')}
                    >
                        Tổng quan
                    </button>
                    <button
                        className={`tab-btn ${selectedTab === 'ai-insights' ? 'active' : ''}`}
                        onClick={() => this.handleTabChange('ai-insights')}
                    >
                        🤖 AI Insights
                    </button>
                    <button
                        className={`tab-btn ${selectedTab === 'datasets' ? 'active' : ''}`}
                        onClick={() => this.handleTabChange('datasets')}
                    >
                        Top Datasets
                    </button>
                    <button
                        className={`tab-btn ${selectedTab === 'categories' ? 'active' : ''}`}
                        onClick={() => this.handleTabChange('categories')}
                    >
                        Categories
                    </button>
                    <button
                        className={`tab-btn ${selectedTab === 'packages' ? 'active' : ''}`}
                        onClick={() => this.handleTabChange('packages')}
                    >
                        Packages
                    </button>
                </div>

                <div className="dashboard-content">
                    {selectedTab === 'overview' && (
                        <>
                            {this.renderOverviewCards()}
                            {this.renderTopDatasets()}
                        </>
                    )}

                    {selectedTab === 'ai-insights' && <AIInsightsPanel />}

                    {selectedTab === 'datasets' && this.renderTopDatasets()}

                    {selectedTab === 'categories' && this.renderCategoryStats()}

                    {selectedTab === 'packages' && this.renderPackageStats()}
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        isLoadingAnalytics: state.analytics.isLoadingAnalytics,
        marketAnalytics: state.analytics.marketAnalytics,
        analyticsError: state.analytics.analyticsError,
        language: state.app.language
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        fetchMarketAnalytics: () => dispatch(actions.fetchMarketAnalytics())
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(MarketAnalyticsDashboard);