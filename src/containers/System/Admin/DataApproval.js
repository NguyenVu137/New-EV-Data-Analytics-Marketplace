import React, { Component } from 'react';
import { connect } from 'react-redux';
import './DataApproval.scss';
import * as actions from "../../../store/actions";
import { LANGUAGES } from '../../../utils';

class DataApproval extends Component {
    componentDidUpdate(prevProps) {
        // Nếu categoryRedux hoặc formatRedux thay đổi, map lại datasets
        if (
            (prevProps.categoryRedux !== this.props.categoryRedux && this.props.categoryRedux && this.props.categoryRedux.length > 0) ||
            (prevProps.formatRedux !== this.props.formatRedux && this.props.formatRedux && this.props.formatRedux.length > 0)
        ) {
            this.forceUpdate(); // Gọi lại render để map lại dữ liệu
        }
    }
    constructor(props) {
        super(props);
        this.state = {
            datasets: [],
            selectedDataset: null,
            showRejectModal: false,
            rejectReason: '',
            notification: '',
            notificationType: '',
            filterStatus: 'ALL'
            , currentPage: 1
            , pageSize: 10
        }
    }

    componentDidMount() {
        this.fetchDatasetsWithPagination(1, this.state.filterStatus);
        this.props.getCategoryStart();
        this.props.getFormatStart();
        this.props.getStatusStart();
    }

    fetchDatasetsWithPagination = async (page, filterStatus = this.state.filterStatus) => {
        const limit = this.state.pageSize;
        // Luôn truyền status, nếu filterStatus là ALL thì truyền 'ALL'
        const status = filterStatus;
        const res = await this.props.fetchAllDatasetsForAdmin({ page, limit, status });
        if (res && res.data) {
            // Log dữ liệu trả về để debug
            console.log('API datasets:', res.data.datasets);
            console.log('API pagination:', res.data.pagination);
            this.setState({
                datasets: res.data.datasets || [],
                currentPage: res.data.pagination.page,
                pageSize: res.data.pagination.limit,
                totalPages: res.data.pagination.totalPages,
                totalItems: res.data.pagination.total
            });
        }
    }

    // Không cần cập nhật datasets từ props nữa

    showNotification = (message, type) => {
        this.setState({
            notification: message,
            notificationType: type
        });
        setTimeout(() => this.setState({ notification: '', notificationType: '' }), 3000);
    }

    handleApprove = async (dataset) => {
        if (window.confirm(`Bạn có chắc muốn duyệt dataset "${dataset.title}"?`)) {
            const res = await this.props.approveDataset(dataset.id);
            if (res && res.success) {
                this.showNotification(res.message, 'success');
                // Cập nhật lại dữ liệu trang hiện tại và trạng thái hiện tại
                this.fetchDatasetsWithPagination(this.state.currentPage, this.state.filterStatus);
            } else {
                this.showNotification(res?.message || 'Duyệt thất bại', 'error');
            }
        }
    }

    openRejectModal = (dataset) => {
        this.setState({
            selectedDataset: dataset,
            showRejectModal: true,
            rejectReason: ''
        });
    }

    closeRejectModal = () => {
        this.setState({
            selectedDataset: null,
            showRejectModal: false,
            rejectReason: ''
        });
    }

    handleReject = async () => {
        const { selectedDataset, rejectReason } = this.state;

        if (!rejectReason.trim()) {
            this.showNotification('Vui lòng nhập lý do từ chối', 'error');
            return;
        }

        const res = await this.props.rejectDataset(selectedDataset.id, rejectReason);
        if (res && res.success) {
            this.showNotification(res.message, 'success');
            this.closeRejectModal();
            // Cập nhật lại dữ liệu trang hiện tại và trạng thái hiện tại
            this.fetchDatasetsWithPagination(this.state.currentPage, this.state.filterStatus);
        } else {
            this.showNotification(res?.message || 'Từ chối thất bại', 'error');
        }
    }

    getStatusBadge = (status_code) => {
        const statusConfig = {
            'S1': { text: 'Chờ duyệt', class: 'badge-warning' },
            'S2': { text: 'Đã duyệt', class: 'badge-success' },
            'S3': { text: 'Từ chối', class: 'badge-danger' }
        };
        const config = statusConfig[status_code] || statusConfig['S1'];
        return <span className={`badge ${config.class}`}>{config.text}</span>;
    }

    // Không filter/slice lại, chỉ dùng dữ liệu trả về từ API

    handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > (this.state.totalPages || 1)) return;
        // Gọi lại API với page mới, state sẽ được cập nhật từ dữ liệu trả về
        this.fetchDatasetsWithPagination(newPage, this.state.filterStatus);
    }

    handleFilterChange = (newStatus) => {
        this.setState({ filterStatus: newStatus }, () => {
            this.fetchDatasetsWithPagination(1, newStatus);
        });
    }

    render() {
        const { showRejectModal, selectedDataset, rejectReason, notification, notificationType, filterStatus } = this.state;
        const { language } = this.props;

        const { categoryRedux, formatRedux } = this.props;
        // Log để debug
        console.log('categoryRedux:', categoryRedux);
        console.log('formatRedux:', formatRedux);
        const datasets = this.state.datasets.map(ds => {
            console.log('dataset code:', ds.category_code, ds.format_code);
            // Map category
            let categoryObj = null;
            if (ds.category_code && Array.isArray(categoryRedux) && categoryRedux.length > 0) {
                categoryObj = categoryRedux.find(c => c.key === ds.category_code);
            }
            // Map format
            let formatObj = null;
            if (ds.format_code && Array.isArray(formatRedux) && formatRedux.length > 0) {
                formatObj = formatRedux.find(f => f.key === ds.format_code);
            }
            return {
                ...ds,
                category: categoryObj,
                format: formatObj
            };
        });
        const pendingCount = datasets.filter(d => d.status_code === 'S1').length;
        // Kiểm tra có provider info không
        const hasProviderInfo = datasets.some(item => item.provider && (item.provider.firstName || item.provider.lastName));
        // Luôn lấy currentPage, totalPages từ state
        const { currentPage, totalPages, totalItems } = this.state;

        return (
            <div className="data-approval-container">
                <div className="title">
                    Kiểm Duyệt Dataset
                    {pendingCount > 0 && (
                        <span className="badge badge-danger ml-2">{pendingCount} chờ duyệt</span>
                    )}
                </div>

                <div className="data-approval-body">
                    <div className="container">
                        {notification &&
                            <div className={`alert ${notificationType === 'success' ? 'alert-success' : 'alert-danger'} text-center`}>
                                {notification}
                            </div>
                        }

                        <div className="row mb-3">
                            <div className="col-12">
                                <div className="btn-group" role="group">
                                    <button
                                        className={`btn ${filterStatus === 'ALL' ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => this.handleFilterChange('ALL')}>
                                        Tất cả
                                    </button>
                                    <button
                                        className={`btn ${filterStatus === 'S1' ? 'btn-warning' : 'btn-outline-warning'}`}
                                        onClick={() => this.handleFilterChange('S1')}>
                                        Chờ duyệt
                                    </button>
                                    <button
                                        className={`btn ${filterStatus === 'S2' ? 'btn-success' : 'btn-outline-success'}`}
                                        onClick={() => this.handleFilterChange('S2')}>
                                        Đã duyệt
                                    </button>
                                    <button
                                        className={`btn ${filterStatus === 'S3' ? 'btn-danger' : 'btn-outline-danger'}`}
                                        onClick={() => this.handleFilterChange('S3')}>
                                        Từ chối
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-12">
                                <table className="table table-striped table-hover">
                                    <thead className="thead-dark">
                                        <tr>
                                            <th>Tiêu đề</th>
                                            {hasProviderInfo && <th>Provider</th>}
                                            <th>Danh mục</th>
                                            <th>Định dạng</th>
                                            <th>Mô tả</th>
                                            <th>Trạng thái</th>
                                            <th>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categoryRedux && categoryRedux.length > 0 && formatRedux && formatRedux.length > 0 && datasets && datasets.length > 0 ? (
                                            datasets.map((item, index) => (
                                                <tr key={index} className={item.status_code === 'S1' ? 'table-warning' : ''}>
                                                    <td><strong>{item.title}</strong></td>
                                                    {hasProviderInfo && (
                                                        <td>
                                                            {item.provider && (item.provider.firstName || item.provider.lastName) ?
                                                                `${item.provider.firstName || ''} ${item.provider.lastName || ''}`.trim() :
                                                                <span style={{ color: 'orange' }}>Không xác định <i className="fa fa-info-circle" /></span>}
                                                        </td>
                                                    )}
                                                    <td>
                                                        {item.category && (item.category.valueVi || item.category.valueEn) ?
                                                            (language === LANGUAGES.VI ? (item.category.valueVi || 'Không xác định') : (item.category.valueEn || 'Unknown')) :
                                                            <span style={{ color: 'orange' }}>Không xác định</span>}
                                                    </td>
                                                    <td>
                                                        {item.format && (item.format.valueVi || item.format.valueEn) ?
                                                            (language === LANGUAGES.VI ? (item.format.valueVi || 'Không xác định') : (item.format.valueEn || 'Unknown')) :
                                                            <span style={{ color: 'orange' }}>Không xác định</span>}
                                                    </td>
                                                    <td>
                                                        <div className="text-truncate" style={{ maxWidth: '200px' }} title={item.description}>
                                                            {item.description || <span style={{ color: 'orange' }}>Không xác định</span>}
                                                        </div>
                                                    </td>
                                                    <td>{this.getStatusBadge(item.status_code)}</td>
                                                    <td>
                                                        {item.status_code === 'S1' && (
                                                            <>
                                                                <button
                                                                    className="btn btn-sm btn-success mr-1"
                                                                    onClick={() => this.handleApprove(item)}
                                                                    title="Duyệt">
                                                                    <i className="fa-solid fa-check"></i> Duyệt
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-danger"
                                                                    onClick={() => this.openRejectModal(item)}
                                                                    title="Từ chối">
                                                                    <i className="fa-solid fa-times"></i> Từ chối
                                                                </button>
                                                            </>
                                                        )}
                                                        {item.status_code === 'S2' && (
                                                            <span className="text-success">
                                                                <i className="fa-solid fa-check-circle"></i> Đã duyệt
                                                            </span>
                                                        )}
                                                        {item.status_code === 'S3' && (
                                                            <span className="text-danger" title={item.access_policy}>
                                                                <i className="fa-solid fa-times-circle"></i> Đã từ chối
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={hasProviderInfo ? "7" : "6"} className="text-center">
                                                    {filterStatus === 'S1' ? 'Không có dataset nào chờ duyệt' : 'Chưa có dataset nào'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                {/* Pagination */}
                                <nav className="d-flex justify-content-center align-items-center mt-3">
                                    <ul className="pagination mb-0">
                                        <li className={`page-item ${currentPage <= 1 ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => this.handlePageChange(currentPage - 1)} disabled={currentPage <= 1}>Prev</button>
                                        </li>
                                        {Array.from({ length: totalPages }, (_, i) => (
                                            <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                                <button className="page-link" onClick={() => this.handlePageChange(i + 1)}>{i + 1}</button>
                                            </li>
                                        ))}
                                        <li className={`page-item ${currentPage >= totalPages ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => this.handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages}>Next</button>
                                        </li>
                                    </ul>
                                    <span className="ml-3">Tổng: {totalItems || this.state.datasets.length} dataset</span>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reject Modal */}
                {showRejectModal && (
                    <div className="modal-overlay" onClick={this.closeRejectModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h5>Từ chối Dataset</h5>
                                <button className="close-btn" onClick={this.closeRejectModal}>×</button>
                            </div>
                            <div className="modal-body">
                                <p><strong>Dataset:</strong> {selectedDataset?.title}</p>
                                <p><strong>Provider:</strong> {selectedDataset?.provider ?
                                    `${selectedDataset.provider.firstName} ${selectedDataset.provider.lastName}` :
                                    'N/A'}</p>
                                <div className="form-group">
                                    <label>Lý do từ chối <span className="text-danger">*</span></label>
                                    <textarea
                                        className="form-control"
                                        rows="4"
                                        value={rejectReason}
                                        onChange={(e) => this.setState({ rejectReason: e.target.value })}
                                        placeholder="Nhập lý do từ chối dataset này..."
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={this.closeRejectModal}>
                                    Hủy
                                </button>
                                <button className="btn btn-danger" onClick={this.handleReject}>
                                    Từ chối Dataset
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

const mapStateToProps = state => ({
    datasets: state.admin.datasets,
    categoryRedux: state.admin.categories,
    formatRedux: state.admin.formats,
    statusRedux: state.admin.statuses,
    language: state.app.language
});

const mapDispatchToProps = dispatch => ({
    fetchAllDatasets: () => dispatch(actions.fetchAllDatasets()),
    approveDataset: (id) => dispatch(actions.approveDataset(id)),
    rejectDataset: (id, reason) => dispatch(actions.rejectDataset(id, reason)),
    getCategoryStart: () => dispatch(actions.fetchCategoryStart()),
    getFormatStart: () => dispatch(actions.fetchFormatStart()),
    getStatusStart: () => dispatch(actions.fetchStatusStart()),
    fetchAllDatasetsForAdmin: (params) => dispatch(actions.fetchAllDatasetsForAdmin(params)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DataApproval);