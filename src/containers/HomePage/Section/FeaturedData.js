import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from '../../../axios';
import DatasetDetailModal from '../../../components/DatasetDetail/DatasetDetailTwoPanel';

class FeaturedData extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            items: [], 
            page: 1,      
            perPage: 12, 
            total: 0, 
            loading: false, 
            allItems: [],
            isFiltered: false,
            selectedDataset: null,
            filters: {
                timeRangeStart: '',
                timeRangeEnd: '',
                region: '',
                data_type: '',
                vehicle_type: '',
                battery_type: '',
                provider: '',
                format: ''
            }
        };
    }

    componentDidMount() {
        this.fetchPage(1);
    }

    updateFilters = (searchParams) => {
        this.setState({
            filters: {
                ...this.state.filters,
                ...searchParams
            },
            isFiltered: true,
            page: 1
        }, () => {
            this.fetchPage(1);
        });
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
                provider: '',
                format: ''
            },
            isFiltered: false,
            page: 1
        }, () => {
            this.fetchPage(1);
        });
    }

    async fetchPage(page = 1) {
        this.setState({ loading: true });
        try {
            const { filters } = this.state;
            console.log('Fetching with filters:', filters);
            
            const params = {
                page: page,
                perPage: 12,
                ...filters,
            };
            console.log('Request params:', params);
            
            const resp = await axios.get('/api/datasets', {
                params: params
            });
            const { items, total, totalPages } = resp;
            
            this.setState({
                items: items,
                page: page,
                total: total,
                totalPages: totalPages,
                loading: false
            });
        } catch (err) {
            console.error('Fetch error:', err);
            this.setState({
                loading: false,
                error: err.message
            });
        }
    }

    handleFilterChange = (name, value) => {
        console.log('Filter changing:', name, value);
        
        const isFiltered = Object.values({
            ...this.state.filters,
            [name]: value
        }).some(val => val !== '');
        
        this.setState(prevState => ({
            filters: {
                ...prevState.filters,
                [name]: value
            },
            isFiltered: isFiltered
        }), () => {
            console.log('Updated filters:', this.state.filters);
            this.fetchPage(1);
        });
    }

    handleDatasetClick = async (dataset) => {
        try {
            const response = await axios.get(`/api/datasets/${dataset.id}`);
            console.log('Dataset detail response:', response);
            // axios interceptor returns response.data already, so response is { success, data: {...} }
            const datasetDetail = response.data || response;
            this.setState({ selectedDataset: datasetDetail });
        } catch (error) {
            console.error('Error fetching dataset details:', error);
            this.setState({ selectedDataset: dataset });
        }
    }

    handleCloseModal = () => {
        this.setState({ selectedDataset: null });
    }

    renderItem(item, idx) {
        const src = item && (item.thumbnailUrl || item.image || item.thumbnail || item.cover);
        const title = item && (item.title || item.name || '');
        return (
            <div 
                key={item.id || idx} 
                className="section-customize"
                onClick={() => this.handleDatasetClick(item)}
            >
                <div className="image-card">
                    {src ? (
                        <img src={src} alt={title} />
                    ) : (
                        <div className="image-placeholder">
                            {(title || '').slice(0,1).toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="card-caption">
                    <span>{title}</span>
                </div>
            </div>
        );
    }

    render() {
        const { items, loading, page, perPage, total, selectedDataset } = this.state;
        
        return (
            <div className="section-share section-featured-data">
                <div className="section-container">
                    <div className="section-header">
                        <div className="header-top">
                            <div className="title-section">
                                {this.state.isFiltered ? 'Kết quả tìm kiếm' : 'Dữ liệu nổi bật'}
                                {this.state.isFiltered && ` (${total})`}
                            </div>
                        </div>

                        <div className="filters">
                            <input 
                                type="date"
                                value={this.state.filters.timeRangeStart} 
                                onChange={(e) => this.handleFilterChange('timeRangeStart', e.target.value)}
                                placeholder="Từ ngày"
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    border: '1px solid #e0e0e0',
                                    flex: '1 1 auto',
                                    minWidth: '110px',
                                    maxWidth: '200px',
                                    fontSize: '14px',
                                    cursor: 'pointer'
                                }}
                            />
                            <input 
                                type="date"
                                value={this.state.filters.timeRangeEnd}
                                onChange={(e) => this.handleFilterChange('timeRangeEnd', e.target.value)}
                                placeholder="Đến ngày"
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    border: '1px solid #e0e0e0',
                                    flex: '1 1 auto',
                                    minWidth: '110px',
                                    maxWidth: '200px',
                                    fontSize: '14px',
                                    cursor: 'pointer'
                                }}
                            />
                            <select 
                                value={this.state.filters.region}
                                onChange={(e) => this.handleFilterChange('region', e.target.value)}
                            >
                                <option value="">Khu vực</option>
                                <option value="Miền Bắc">Miền Bắc</option>
                                <option value="Miền Trung">Miền Trung</option>
                                <option value="Miền Nam">Miền Nam</option>
                            </select>
                            <select 
                                value={this.state.filters.vehicle_type}
                                onChange={(e) => this.handleFilterChange('vehicle_type', e.target.value)}
                            >
                                <option value="">Loại xe</option>
                                <option value="Ô tô điện">Ô tô điện</option>
                                <option value="Xe máy điện">Xe máy điện</option>
                                <option value="Xe tải điện">Xe tải điện</option>
                            </select>
                            <select 
                                value={this.state.filters.battery_type}
                                onChange={(e) => this.handleFilterChange('battery_type', e.target.value)}
                            >
                                <option value="">Loại pin</option>
                                <option value="Li-ion">Li-ion</option>
                                <option value="LFP">LFP</option>
                                <option value="NMC">NMC</option>
                            </select>
                            <select 
                                value={this.state.filters.provider}
                                onChange={(e) => this.handleFilterChange('provider', e.target.value)}
                            >
                                <option value="">Nhà cung cấp</option>
                                <option value="VinFast">VinFast</option>
                                <option value="GreenCharge">GreenCharge</option>
                                <option value="EVN">EVN</option>
                            </select>
                            <select 
                                value={this.state.filters.format}
                                onChange={(e) => this.handleFilterChange('format', e.target.value)}
                            >
                                <option value="">Định dạng</option>
                                <option value="CSV">CSV</option>
                                <option value="JSON">JSON</option>
                            </select>
                            <button
                                className="btn-reset"
                                onClick={this.resetFilters}
                                disabled={!this.state.isFiltered}
                            >
                                Đặt lại
                            </button>
                        </div>
                    </div>

                    <div className="section-body">
                        <div className="featured-grid">
                            {loading ? (
                                <div className="loading">Đang tải...</div>
                            ) : items && items.length > 0 ? (
                                items.map((item, idx) => this.renderItem(item, idx))
                            ) : (
                                <div className="no-data">Không có dữ liệu</div>
                            )}
                        </div>

                        <div className="pager">
                            <button onClick={() => this.fetchPage(1)} disabled={page === 1}>
                                &lt;&lt;
                            </button>
                            <button onClick={() => this.fetchPage(page - 1)} disabled={page === 1}>
                                &lt;
                            </button>
                            <span>Trang {page}</span>
                            <button onClick={() => this.fetchPage(page + 1)} disabled={page * perPage >= total}>
                                &gt;
                            </button>
                            <button onClick={() => this.fetchPage(Math.ceil(total / perPage))} disabled={page * perPage >= total}>
                                &gt;&gt;
                            </button>
                        </div>
                    </div>

                    {selectedDataset && (
                        <DatasetDetailModal
                            dataset={selectedDataset}
                            onClose={this.handleCloseModal}
                        />
                    )}

                    <style>{`
                        .section-featured-data {
                            margin-bottom: 48px;
                            background: #ffffff;
                        }
                        .section-container {
                            max-width: 1200px;
                            margin: 0 auto;
                            padding: 32px 16px;
                            background: #ffffff;
                            box-sizing: border-box;
                        }
                        .section-header {
                            margin-bottom: 24px;
                            padding: 0;
                            position: relative;
                        }
                        .header-top {
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            margin-bottom: 16px;
                            flex-wrap: wrap;
                            gap: 12px;
                        }
                        .title-section {
                            font-size: 22px;
                            font-weight: 600;
                            color: #2c3e50;
                        }
                        .filters {
                            display: flex;
                            gap: 12px;
                            align-items: center;
                            flex-wrap: wrap;
                            margin-bottom: 32px;
                            background: #f8f9fa;
                            padding: 16px;
                            border-radius: 8px;
                            justify-content: flex-start;
                            width: 100%;
                            box-sizing: border-box;
                        }
                        .filters select {
                            padding: 8px 12px;
                            border-radius: 6px;
                            border: 1px solid #e0e0e0;
                            flex: 1 1 auto;
                            min-width: 110px;
                            max-width: 200px;
                            font-size: 14px;
                            background-color: white;
                            cursor: pointer;
                            transition: border-color 0.2s;
                            box-sizing: border-box;
                        }
                        .filters select:hover {
                            border-color: #00bcd4;
                        }
                        .filters select:focus {
                            outline: none;
                            border-color: #00bcd4;
                            box-shadow: 0 0 0 2px rgba(0,188,212,0.2);
                        }
                        .btn-reset {
                            padding: 8px 16px;
                            border: none;
                            border-radius: 6px;
                            background: #e91e63;
                            color: white;
                            cursor: pointer;
                            font-size: 14px;
                            transition: background 0.2s;
                            white-space: nowrap;
                            flex-shrink: 0;
                        }
                        .btn-reset:hover {
                            background: #d81b60;
                        }
                        .btn-reset:disabled {
                            background: #f48fb1;
                            cursor: not-allowed;
                        }
                        .section-body {
                            width: 100%;
                        }
                        .featured-grid { 
                            display: grid;
                            grid-template-columns: repeat(4, 1fr);
                            gap: 24px;
                            margin-bottom: 24px;
                            width: 100%;
                        }
                        .section-customize {
                            aspect-ratio: 4/3;
                            display: flex;
                            flex-direction: column;
                            border-radius: 12px;
                            overflow: hidden;
                            background: #ffffff;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                            transition: transform 0.2s, box-shadow 0.2s;
                            cursor: pointer;
                            min-width: 0;
                        }
                        .section-customize:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 4px 12px rgba(0,0,0,0.12);
                        }
                        .image-card {
                            flex: 1;
                            position: relative;
                            overflow: hidden;
                            background: #f8f9fa;
                        }
                        .image-card img {
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                            transition: transform 0.3s ease;
                        }
                        .section-customize:hover .image-card img {
                            transform: scale(1.05);
                        }
                        .image-placeholder {
                            width: 100%;
                            height: 100%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 32px;
                            color: #00bcd4;
                            background: #e3f2fd;
                        }
                        .card-caption {
                            padding: 12px;
                            min-height: 64px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            text-align: center;
                            background: #fff;
                            box-sizing: border-box;
                        }
                        .card-caption span {
                            font-size: 14px;
                            font-weight: 500;
                            color: #2c3e50;
                            line-height: 1.4;
                            display: -webkit-box;
                            -webkit-line-clamp: 2;
                            -webkit-box-orient: vertical;
                            overflow: hidden;
                        }
                        .pager {
                            margin-top: 24px;
                            text-align: center;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 8px;
                            flex-wrap: wrap;
                        }
                        .pager button {
                            padding: 8px 12px;
                            border: none;
                            border-radius: 6px;
                            background: #f8f9fa;
                            color: #2c3e50;
                            cursor: pointer;
                            transition: all 0.2s;
                            font-size: 14px;
                        }
                        .pager button:hover:not(:disabled) {
                            background: #e9ecef;
                            color: #000;
                        }
                        .pager button:disabled {
                            opacity: 0.5;
                            cursor: not-allowed;
                        }
                        .pager span {
                            color: #2c3e50;
                            font-size: 14px;
                            margin: 0 8px;
                        }
                        .loading, .no-data {
                            grid-column: 1 / -1;
                            text-align: center;
                            padding: 32px;
                            background: #f8f9fa;
                            border-radius: 8px;
                            color: #6c757d;
                        }

                        @media (max-width: 1200px) {
                            .featured-grid {
                                grid-template-columns: repeat(3, 1fr);
                            }
                        }

                        @media (max-width: 900px) {
                            .featured-grid {
                                grid-template-columns: repeat(2, 1fr);
                                gap: 20px;
                            }
                            .filters select {
                                max-width: 150px;
                            }
                        }

                        @media (max-width: 600px) {
                            .featured-grid {
                                grid-template-columns: 1fr;
                                gap: 16px;
                            }
                            .filters {
                                flex-direction: column;
                                gap: 12px;
                            }
                            .filters select {
                                width: 100%;
                                max-width: none;
                            }
                            .btn-reset {
                                width: 100%;
                            }
                        }
                    `}</style>
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
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(FeaturedData);
