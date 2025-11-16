import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../../store/actions';
import './AIInsightsPanel.scss';
import ReactMarkdown from 'react-markdown';

class AIInsightsPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isRefreshing: false
        };
    }

    componentDidMount() {
        this.loadAIInsights();
    }

    loadAIInsights = async () => {
        await this.props.fetchAIInsights(false);
    };

    handleRefresh = async () => {
        this.setState({ isRefreshing: true });

        try {
            await this.props.fetchAIInsights(true);
        } catch (error) {
            console.error('Refresh error:', error);
        } finally {
            this.setState({ isRefreshing: false });
        }
    };

    formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    formatNumber = (num) => {
        return new Intl.NumberFormat('vi-VN').format(num || 0);
    };

    formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount || 0);
    };

    render() {
        const { isLoadingAIInsights, aiInsights, aiInsightsError } = this.props;
        const { isRefreshing } = this.state;

        // Loading State
        if (isLoadingAIInsights && !aiInsights) {
            return (
                <div className="ai-insights-panel loading">
                    <div className="loading-container">
                        <div className="robot-animation">🤖</div>
                        <h3>AI đang phân tích dữ liệu thị trường...</h3>
                        <p>Gemini AI đang xử lý hàng nghìn dữ liệu EV</p>
                        <div className="spinner"></div>
                        <div className="loading-steps">
                            <div className="step">✓ Thu thập dữ liệu</div>
                            <div className="step active">⏳ Phân tích xu hướng</div>
                            <div className="step">○ Tạo gợi ý</div>
                        </div>
                    </div>
                </div>
            );
        }

        // Error State
        if (aiInsightsError && !aiInsights) {
            return (
                <div className="ai-insights-panel error">
                    <div className="error-container">
                        <div className="error-icon">⚠️</div>
                        <h3>Không thể tải phân tích AI</h3>
                        <p className="error-message">{aiInsightsError}</p>
                        <div className="error-hint">
                            <strong>Gợi ý:</strong>
                            <ul>
                                <li>Kiểm tra API key trong file .env</li>
                                <li>Đảm bảo có kết nối internet</li>
                                <li>Kiểm tra log server để biết chi tiết</li>
                            </ul>
                        </div>
                        <button
                            className="btn-retry"
                            onClick={this.handleRefresh}
                            disabled={isRefreshing}
                        >
                            <i className="fas fa-redo"></i>
                            {isRefreshing ? 'Đang thử lại...' : 'Thử lại'}
                        </button>
                    </div>
                </div>
            );
        }

        // Empty State
        if (!aiInsights) {
            return (
                <div className="ai-insights-panel empty">
                    <div className="empty-container">
                        <div className="empty-icon">🤖</div>
                        <h3>Chưa có phân tích AI</h3>
                        <p>Nhấn nút "Làm mới" để tạo phân tích mới</p>
                        <button
                            className="btn-generate"
                            onClick={this.handleRefresh}
                        >
                            <i className="fas fa-magic"></i> Tạo phân tích AI
                        </button>
                    </div>
                </div>
            );
        }

        // Main Content
        return (
            <div className="ai-insights-panel">
                {/* Header */}
                <div className="panel-header">
                    <div className="header-title">
                        <div className="ai-icon">🤖</div>
                        <div>
                            <h2>AI Insights - Xu hướng phát triển EV</h2>
                            <p className="subtitle">
                                Phân tích thông minh bởi Google Gemini AI
                            </p>
                        </div>
                    </div>
                    <div className="header-actions">
                        <button
                            className={`btn-refresh ${isRefreshing ? 'refreshing' : ''}`}
                            onClick={this.handleRefresh}
                            disabled={isRefreshing}
                        >
                            <i className={`fas fa-sync-alt ${isRefreshing ? 'spinning' : ''}`}></i>
                            {isRefreshing ? 'Đang cập nhật...' : 'Làm mới'}
                        </button>
                    </div>
                </div>

                {/* Meta Info */}
                <div className="panel-meta">
                    <div className="meta-item">
                        <i className="fas fa-clock"></i>
                        <span>Cập nhật: {this.formatDate(aiInsights.generatedAt)}</span>
                    </div>
                    {aiInsights.cached && (
                        <div className="meta-item cached">
                            <i className="fas fa-database"></i>
                            <span>
                                {aiInsights.stale ? 'Cache cũ (Lỗi)' : 'Dữ liệu tạm'}
                                {aiInsights.cacheExpiresIn && ` - Hết hạn sau ${aiInsights.cacheExpiresIn} phút`}
                            </span>
                        </div>
                    )}
                    {!aiInsights.cached && (
                        <div className="meta-item fresh">
                            <i className="fas fa-bolt"></i>
                            <span>Mới tạo</span>
                        </div>
                    )}
                </div>

                {/* Data Snapshot */}
                {aiInsights.dataSnapshot && (
                    <div className="data-snapshot">
                        <div className="snapshot-item">
                            <div className="snapshot-icon">📊</div>
                            <div className="snapshot-content">
                                <span className="label">Datasets</span>
                                <span className="value">
                                    {this.formatNumber(aiInsights.dataSnapshot.totalDatasets)}
                                </span>
                            </div>
                        </div>
                        <div className="snapshot-item">
                            <div className="snapshot-icon">💳</div>
                            <div className="snapshot-content">
                                <span className="label">Giao dịch</span>
                                <span className="value">
                                    {this.formatNumber(aiInsights.dataSnapshot.totalTransactions)}
                                </span>
                            </div>
                        </div>
                        <div className="snapshot-item">
                            <div className="snapshot-icon">⬇️</div>
                            <div className="snapshot-content">
                                <span className="label">Lượt tải</span>
                                <span className="value">
                                    {this.formatNumber(aiInsights.dataSnapshot.totalDownloads)}
                                </span>
                            </div>
                        </div>
                        <div className="snapshot-item">
                            <div className="snapshot-icon">💰</div>
                            <div className="snapshot-content">
                                <span className="label">Doanh thu</span>
                                <span className="value small">
                                    {this.formatCurrency(aiInsights.dataSnapshot.totalRevenue)}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Top Categories */}
                {aiInsights.dataSnapshot?.topCategories && (
                    <div className="top-categories">
                        <strong>📂 Top Categories:</strong>
                        <div className="categories-list">
                            {aiInsights.dataSnapshot.topCategories.map((cat, index) => (
                                <span key={index} className="category-badge">
                                    {cat}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* AI Insights Content */}
                <div className="insights-content">
                    <ReactMarkdown>{aiInsights.insights}</ReactMarkdown>
                </div>

                {/* Footer */}
                <div className="panel-footer">
                    <div className="disclaimer">
                        <i className="fas fa-info-circle"></i>
                        <span>
                            Phân tích được tạo tự động bởi AI dựa trên dữ liệu thực tế từ hệ thống.
                            Vui lòng tham khảo thêm ý kiến chuyên gia trước khi đưa ra quyết định kinh doanh.
                        </span>
                    </div>
                    <div className="powered-by">
                        <span>Powered by</span>
                        <img
                            src="https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg"
                            alt="Gemini"
                            className="gemini-logo"
                        />
                        <strong>Google Gemini</strong>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        isLoadingAIInsights: state.analytics.isLoadingAIInsights,
        aiInsights: state.analytics.aiInsights,
        aiInsightsError: state.analytics.aiInsightsError,
        userInfo: state.user.userInfo
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        fetchAIInsights: (forceRefresh) => dispatch(actions.fetchAIInsights(forceRefresh)),
        regenerateAIInsights: () => dispatch(actions.regenerateAIInsights()),
        clearCache: () => dispatch(actions.clearAIInsightsCache())
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(AIInsightsPanel);