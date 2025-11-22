import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import axios from '../../axios';
import Navbar from '../../components/Navbar';
import './AllDatasets.scss';

class AllDatasets extends Component {
    constructor(props) {
        super(props);
        this.state = {
            items: [],
            page: 1,
            perPage: 12,
            total: 0,
            totalPages: 1,
            loading: false,
            searchKeyword: '',
            filters: {
                timeRangeStart: '',
                timeRangeEnd: '',
                region: '',
                data_type: '',
                vehicle_type: '',
                battery_type: '',
                format: ''
            }
        };
    }

    componentDidMount() {
        this.fetchPage(1);
    }

    async fetchPage(page = 1) {
        this.setState({ loading: true });
        try {
            const { filters, searchKeyword } = this.state;

            const params = {
                page: page,
                perPage: 12,
                keyword: searchKeyword,
                ...filters,
            };

            const resp = await axios.get('/api/datasets', {
                params: params
            });
            console.log('Response:', resp.data);
            const { datasets, pagination } = resp.data;

            this.setState({
                items: datasets || [],
                page: pagination.page,
                total: pagination.total || 0,
                totalPages: pagination.totalPages || 1,
                loading: false
            });
        } catch (err) {
            console.error('Fetch error:', err);
            this.setState({
                loading: false,
                error: err.message,
                items: []
            });
        }
    }

    handleFilterChange = (name, value) => {
        this.setState(prevState => ({
            filters: {
                ...prevState.filters,
                [name]: value
            }
        }), () => {
            this.fetchPage(1);
        });
    }

    handleSearchChange = (e) => {
        this.setState({ searchKeyword: e.target.value });
    }

    handleSearchSubmit = (e) => {
        e.preventDefault();
        this.fetchPage(1);
    }

    resetFilters = () => {
        this.setState({
            filters: {
                timeRangeStart: '',
                timeRangeEnd: '',
                region: '',
                data_type: '',
                vehicle_type: '',
                battery_type: '',
                format: ''
            },
            searchKeyword: '',
            page: 1
        }, () => {
            this.fetchPage(1);
        });
    }

    handleDatasetClick = (dataset) => {
        this.props.history.push(`/detail-data/${dataset.id}`);
    }

    renderItem(item, idx) {
        const src = item && (item.thumbnailUrl || item.image || item.thumbnail || item.cover);
        const title = item && (item.title || item.name || '');
        const price = item?.basicPrice || item?.price || 0;

        return (
            <div
                key={item.id || idx}
                className="dataset-card"
                onClick={() => this.handleDatasetClick(item)}
            >
                <div className="dataset-image">
                    {src ? (
                        <img src={src} alt={title} />
                    ) : (
                        <div className="image-placeholder">
                            {(title || '').slice(0, 1).toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="dataset-info">
                    <h3 className="dataset-title">{title}</h3>
                    <p className="dataset-description">{item.shortDescription || item.description}</p>
                    <div className="dataset-footer">
                        <span className="dataset-price">
                            {price > 0 ? `${price.toLocaleString()} VNĐ` : 'Miễn phí'}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        const { items, loading, page, total, totalPages, searchKeyword } = this.state;
        const isFiltered = Object.values(this.state.filters).some(val => val !== '') || searchKeyword !== '';

        return (
            <div className="all-datasets-page">
                <Navbar />

                <div className="datasets-container">
                    <div className="page-header">
                        <h1>Marketplace - Tất cả dữ liệu</h1>
                        <p>Khám phá và tìm kiếm dữ liệu xe điện được phê duyệt</p>
                    </div>

                    {/* Search Bar */}
                    <form className="search-bar" onSubmit={this.handleSearchSubmit}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, mô tả..."
                            value={searchKeyword}
                            onChange={this.handleSearchChange}
                        />
                        <button type="submit">
                            <i className="fa-solid fa-magnifying-glass"></i> Tìm kiếm
                        </button>
                    </form>

                    {/* Filters */}
                    <div className="filters-section">
                        <div className="filters-grid">
                            <input
                                type="date"
                                value={this.state.filters.timeRangeStart}
                                onChange={(e) => this.handleFilterChange('timeRangeStart', e.target.value)}
                                placeholder="Từ ngày"
                            />
                            <input
                                type="date"
                                value={this.state.filters.timeRangeEnd}
                                onChange={(e) => this.handleFilterChange('timeRangeEnd', e.target.value)}
                                placeholder="Đến ngày"
                            />
                            <select
                                value={this.state.filters.region}
                                onChange={(e) => this.handleFilterChange('region', e.target.value)}
                            >
                                <option value="">Tất cả khu vực</option>
                                <option value="Miền Bắc">Miền Bắc</option>
                                <option value="Miền Trung">Miền Trung</option>
                                <option value="Miền Nam">Miền Nam</option>
                            </select>
                            <select
                                value={this.state.filters.data_type}
                                onChange={(e) => this.handleFilterChange('data_type', e.target.value)}
                            >
                                <option value="">Loại dữ liệu</option>
                                <option value="Sạc xe">Sạc xe</option>
                                <option value="Hoạt động xe">Hoạt động xe</option>
                                <option value="Pin">Pin</option>
                            </select>
                            <select
                                value={this.state.filters.vehicle_type}
                                onChange={(e) => this.handleFilterChange('vehicle_type', e.target.value)}
                            >
                                <option value="">Tất cả loại xe</option>
                                <option value="Ô tô điện">Ô tô điện</option>
                                <option value="Xe máy điện">Xe máy điện</option>
                                <option value="Xe tải điện">Xe tải điện</option>
                                <option value="Xe buýt điện">Xe buýt điện</option>
                            </select>
                            <select
                                value={this.state.filters.battery_type}
                                onChange={(e) => this.handleFilterChange('battery_type', e.target.value)}
                            >
                                <option value="">Tất cả loại pin</option>
                                <option value="Li-ion">Li-ion</option>
                                <option value="LFP">LFP</option>
                                <option value="NMC">NMC</option>
                                <option value="LTO">LTO</option>
                            </select>
                            <select
                                value={this.state.filters.format}
                                onChange={(e) => this.handleFilterChange('format', e.target.value)}
                            >
                                <option value="">Tất cả định dạng</option>
                                <option value="CSV">CSV</option>
                                <option value="JSON">JSON</option>
                                <option value="XML">XML</option>
                            </select>
                        </div>
                        <button
                            className="btn-reset"
                            onClick={this.resetFilters}
                            disabled={!isFiltered}
                        >
                            <i className="fa-solid fa-rotate-left"></i> Đặt lại
                        </button>
                    </div>

                    {/* Results Info */}
                    <div className="results-info">
                        <span>Tìm thấy <strong>{total}</strong> kết quả</span>
                        <span>Trang {page} / {totalPages}</span>
                    </div>

                    {/* Datasets Grid */}
                    <div className="datasets-grid">
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
                                <p>Không tìm thấy dữ liệu phù hợp</p>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AllDatasets));
