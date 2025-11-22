import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import axios from '../../axios';
import Navbar from '../../components/Navbar';
import './AllProviders.scss';

class AllProviders extends Component {
    constructor(props) {
        super(props);
        this.state = {
            items: [],
            page: 1,
            perPage: 12,
            total: 0,
            totalPages: 1,
            loading: false,
            searchKeyword: ''
        };
    }

    componentDidMount() {
        this.fetchPage(1);
    }

    async fetchPage(page = 1) {
        this.setState({ loading: true });
        try {
            const { searchKeyword } = this.state;

            const params = {
                page: page,
                perPage: 12,
                keyword: searchKeyword
            };

            console.log('Fetching providers with params:', params);

            const response = await axios.get('/api/providers', {
                params: params
            });

            console.log('Full Response:', response);
            console.log('Response data:', response.data);

            const resp = response.data || response;

            console.log('Processed resp:', resp);

            const { items, total, totalPages } = resp;

            console.log('Extracted data - items:', items, 'total:', total, 'totalPages:', totalPages);

            this.setState({
                items: items || [],
                page: page,
                total: total || 0,
                totalPages: totalPages || 1,
                loading: false
            });
        } catch (err) {
            console.error('Fetch error:', err);
            console.error('Error details:', err.response);
            this.setState({
                loading: false,
                error: err.message,
                items: []
            });
        }
    }

    handleSearchChange = (e) => {
        this.setState({ searchKeyword: e.target.value });
    }

    handleSearchSubmit = (e) => {
        e.preventDefault();
        this.fetchPage(1);
    }

    resetSearch = () => {
        this.setState({
            searchKeyword: '',
            page: 1
        }, () => {
            this.fetchPage(1);
        });
    }

    handleProviderClick = (provider) => {
        this.props.history.push(`/provider/${provider.id}`);
    }

    renderItem(item, idx) {
        const src = item?.image;
        const name = `${item?.firstName || ''} ${item?.lastName || ''}`.trim() || item?.email || '';

        console.log('Rendering provider:', item);
        console.log('Approved datasets count:', item.approvedDatasets);

        return (
            <div
                key={item.id || idx}
                className="provider-card"
                onClick={() => this.handleProviderClick(item)}
            >
                <div className="provider-image">
                    {src ? (
                        <img src={src} alt={name} />
                    ) : (
                        <div className="image-placeholder">
                            {name.slice(0, 1).toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="provider-info">
                    <h3 className="provider-name">{name}</h3>
                    <p className="provider-email">{item.email}</p>
                    {item.address && (
                        <p className="provider-address">
                            <i className="fa-solid fa-location-dot"></i> {item.address}
                        </p>
                    )}
                    <div className="provider-footer">
                        <div className="provider-stats">
                            <span className="stat-item">
                                <i className="fa-solid fa-database"></i>
                                {item.approvedDatasets || 0} datasets
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        const { items, loading, page, total, totalPages, searchKeyword } = this.state;
        const isSearching = searchKeyword !== '';

        return (
            <div className="all-providers-page">
                <Navbar />

                <div className="providers-container">
                    <div className="page-header">
                        <h1>Nhà cung cấp dữ liệu</h1>
                        <p>Khám phá các nhà cung cấp dữ liệu xe điện uy tín</p>
                    </div>

                    {/* Search Bar */}
                    <div className="search-section">
                        <form className="search-bar" onSubmit={this.handleSearchSubmit}>
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên, email..."
                                value={searchKeyword}
                                onChange={this.handleSearchChange}
                            />
                            <button type="submit">
                                <i className="fa-solid fa-magnifying-glass"></i> Tìm kiếm
                            </button>
                        </form>
                        {isSearching && (
                            <button
                                className="btn-reset"
                                onClick={this.resetSearch}
                            >
                                <i className="fa-solid fa-rotate-left"></i> Đặt lại
                            </button>
                        )}
                    </div>

                    {/* Results Info */}
                    <div className="results-info">
                        <span>Tìm thấy <strong>{total}</strong> nhà cung cấp</span>
                        <span>Trang {page} / {totalPages}</span>
                    </div>

                    {/* Providers Grid */}
                    <div className="providers-grid">
                        {loading ? (
                            <div className="loading-state">
                                <i className="fa-solid fa-spinner fa-spin"></i>
                                <p>Đang tải...</p>
                            </div>
                        ) : items && items.length > 0 ? (
                            items.map((item, idx) => this.renderItem(item, idx))
                        ) : (
                            <div className="empty-state">
                                <i className="fa-solid fa-inbox"></i>
                                <p>Không tìm thấy nhà cung cấp phù hợp</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {!loading && items.length > 0 && (
                        <div className="pagination">
                            <button
                                onClick={() => this.fetchPage(1)}
                                disabled={page === 1}
                                title="Trang đầu"
                            >
                                <i className="fa-solid fa-angles-left"></i>
                            </button>
                            <button
                                onClick={() => this.fetchPage(page - 1)}
                                disabled={page === 1}
                                title="Trang trước"
                            >
                                <i className="fa-solid fa-angle-left"></i>
                            </button>
                            <span className="page-info">
                                Trang <strong>{page}</strong> / {totalPages}
                            </span>
                            <button
                                onClick={() => this.fetchPage(page + 1)}
                                disabled={page >= totalPages}
                                title="Trang sau"
                            >
                                <i className="fa-solid fa-angle-right"></i>
                            </button>
                            <button
                                onClick={() => this.fetchPage(totalPages)}
                                disabled={page >= totalPages}
                                title="Trang cuối"
                            >
                                <i className="fa-solid fa-angles-right"></i>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.user.isLoggedIn
    };
};

const mapDispatchToProps = dispatch => {
    return {};
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AllProviders));
