import React, { Component } from 'react';
import { connect } from 'react-redux';
import './DataApproval.scss';
import * as actions from "../../../store/actions";
import { LANGUAGES } from '../../../utils';

class DataApproval extends Component {
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
        }
    }

    componentDidMount() {
        this.props.fetchAllDatasetsForAdmin();
        this.props.getCategoryStart();
        this.props.getFormatStart();
        this.props.getStatusStart();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.datasets !== this.props.datasets) {
            this.setState({
                datasets: this.props.datasets || []
            });
        }
    }

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
        } else {
            this.showNotification(res?.message || 'Từ chối thất bại', 'error');
        }
    }

    getStatusBadge = (status_code) => {
        const statusConfig = {
            'PENDING': { text: 'Chờ duyệt', class: 'badge-warning' },
            'APPROVED': { text: 'Đã duyệt', class: 'badge-success' },
            'REJECTED': { text: 'Từ chối', class: 'badge-danger' }
        };
        const config = statusConfig[status_code] || statusConfig['PENDING'];
        return <span className={`badge ${config.class}`}>{config.text}</span>;
    }

    getFilteredDatasets = () => {
        const { datasets, filterStatus } = this.state;
        if (filterStatus === 'ALL') {
            return datasets;
        }
        return datasets.filter(d => d.status_code === filterStatus);
    }

    render() {
        const { showRejectModal, selectedDataset, rejectReason, notification, notificationType, filterStatus } = this.state;
        const { language } = this.props;
        const filteredDatasets = this.getFilteredDatasets();
        const pendingCount = this.state.datasets.filter(d => d.status_code === 'PENDING').length;

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
                                        onClick={() => this.setState({ filterStatus: 'ALL' })}>
                                        Tất cả ({this.state.datasets.length})
                                    </button>
                                    <button
                                        className={`btn ${filterStatus === 'PENDING' ? 'btn-warning' : 'btn-outline-warning'}`}
                                        onClick={() => this.setState({ filterStatus: 'PENDING' })}>
                                        Chờ duyệt ({pendingCount})
                                    </button>
                                    <button
                                        className={`btn ${filterStatus === 'APPROVED' ? 'btn-success' : 'btn-outline-success'}`}
                                        onClick={() => this.setState({ filterStatus: 'APPROVED' })}>
                                        Đã duyệt ({this.state.datasets.filter(d => d.status_code === 'APPROVED').length})
                                    </button>
                                    <button
                                        className={`btn ${filterStatus === 'REJECTED' ? 'btn-danger' : 'btn-outline-danger'}`}
                                        onClick={() => this.setState({ filterStatus: 'REJECTED' })}>
                                        Từ chối ({this.state.datasets.filter(d => d.status_code === 'REJECTED').length})
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
                                            <th>Provider</th>
                                            <th>Danh mục</th>
                                            <th>Định dạng</th>
                                            <th>Mô tả</th>
                                            <th>Trạng thái</th>
                                            <th>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredDatasets && filteredDatasets.length > 0 ? (
                                            filteredDatasets.map((item, index) => (
                                                <tr key={index} className={item.status_code === 'PENDING' ? 'table-warning' : ''}>
                                                    <td><strong>{item.title}</strong></td>
                                                    <td>
                                                        {item.provider ?
                                                            `${item.provider.firstName} ${item.provider.lastName}` :
                                                            'N/A'}
                                                    </td>
                                                    <td>
                                                        {item.category ?
                                                            (language === LANGUAGES.VI ? item.category.valueVi : item.category.valueEn) :
                                                            ''}
                                                    </td>
                                                    <td>
                                                        {item.format ?
                                                            (language === LANGUAGES.VI ? item.format.valueVi : item.format.valueEn) :
                                                            ''}
                                                    </td>
                                                    <td>
                                                        <div className="text-truncate" style={{ maxWidth: '200px' }} title={item.description}>
                                                            {item.description}
                                                        </div>
                                                    </td>
                                                    <td>{this.getStatusBadge(item.status_code)}</td>
                                                    <td>
                                                        {item.status_code === 'PENDING' && (
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
                                                        {item.status_code === 'APPROVED' && (
                                                            <span className="text-success">
                                                                <i className="fa-solid fa-check-circle"></i> Đã duyệt
                                                            </span>
                                                        )}
                                                        {item.status_code === 'REJECTED' && (
                                                            <span className="text-danger" title={item.access_policy}>
                                                                <i className="fa-solid fa-times-circle"></i> Đã từ chối
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="text-center">
                                                    {filterStatus === 'PENDING' ? 'Không có dataset nào chờ duyệt' : 'Chưa có dataset nào'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
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
    fetchAllDatasetsForAdmin: () => dispatch(actions.fetchAllDatasetsForAdmin()),

});

export default connect(mapStateToProps, mapDispatchToProps)(DataApproval);