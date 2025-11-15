import React, { Component } from 'react';
import { connect } from 'react-redux';
import './DataManage.scss';
import * as actions from "../../../store/actions";
import { CRUD_ACTIONS, LANGUAGES } from '../../../utils';

class DataManage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            datasets: [],
            categoryArr: [],
            formatArr: [],
            statusArr: [],

            title: '',
            description: '',
            category_code: '',
            format_code: '',
            status_code: '',
            api_url: '',
            basicPrice: 0,
            standardPrice: 0,
            premiumPrice: 0,

            // Files management
            selectedFiles: [],
            existingFiles: [],

            // Metadata management
            metadata: [{ key: '', value: '' }],

            action: CRUD_ACTIONS.CREATE,
            editId: '',
            notification: '',
            notificationType: ''
        }
    }

    componentDidMount() {
        this.props.fetchAllDatasets();
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

        if (prevProps.categoryRedux !== this.props.categoryRedux) {
            const categories = this.props.categoryRedux;
            this.setState({
                categoryArr: categories,
                category_code: categories && categories.length > 0 ? categories[0].key : ''
            });
        }

        if (prevProps.formatRedux !== this.props.formatRedux) {
            const formats = this.props.formatRedux;
            this.setState({
                formatArr: formats,
                format_code: formats && formats.length > 0 ? formats[0].key : ''
            });
        }

        if (prevProps.statusRedux !== this.props.statusRedux) {
            const statuses = this.props.statusRedux;
            this.setState({
                statusArr: statuses,
                status_code: statuses && statuses.length > 0 ? statuses[0].key : ''
            });
        }
    }

    onChangeInput = (event, field) => {
        this.setState({ [field]: event.target.value });
    }

    //  FILE UPLOAD HANDLERS 
    handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        this.setState(prevState => ({
            selectedFiles: [...prevState.selectedFiles, ...files]
        }));
    }

    removeSelectedFile = (index) => {
        this.setState(prevState => ({
            selectedFiles: prevState.selectedFiles.filter((_, i) => i !== index)
        }));
    }

    handleDeleteExistingFile = async (fileId) => {
        if (window.confirm('Bạn có chắc muốn xóa file này?')) {
            const res = await this.props.deleteFile(fileId);
            if (res && res.success) {
                this.showNotification(res.message, 'success');
                this.setState(prevState => ({
                    existingFiles: prevState.existingFiles.filter(f => f.id !== fileId)
                }));
            } else {
                this.showNotification(res?.message || 'Xóa file thất bại', 'error');
            }
        }
    }

    //  METADATA HANDLERS 
    addMetadata = () => {
        this.setState(prevState => ({
            metadata: [...prevState.metadata, { key: '', value: '' }]
        }));
    }

    removeMetadata = (index) => {
        this.setState(prevState => ({
            metadata: prevState.metadata.filter((_, i) => i !== index)
        }));
    }

    onChangeMetadata = (index, field, value) => {
        this.setState(prevState => {
            const newMetadata = [...prevState.metadata];
            newMetadata[index][field] = value;
            return { metadata: newMetadata };
        });
    }

    checkValidation = () => {
        const { title, description, category_code, format_code } = this.state;
        if (!title || !description || !category_code || !format_code) {
            this.showNotification('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
            return false;
        }
        return true;
    }

    showNotification = (message, type) => {
        this.setState({
            notification: message,
            notificationType: type
        });
        setTimeout(() => this.setState({ notification: '', notificationType: '' }), 3000);
    }

    handleSave = async () => {
        if (!this.checkValidation()) return;

        const { action, editId, title, description, category_code, format_code,
            api_url, basicPrice, standardPrice, premiumPrice, status_code,
            selectedFiles, metadata } = this.state;

        const datasetData = {
            title,
            description,
            category_code,
            format_code,
            api_url,
            basicPrice: parseFloat(basicPrice) || 0,
            standardPrice: parseFloat(standardPrice) || 0,
            premiumPrice: parseFloat(premiumPrice) || 0,
            status_code: status_code
        };

        // Lọc metadata có key và value
        const validMetadata = metadata.filter(m => m.key && m.value);

        try {
            let res;
            if (action === CRUD_ACTIONS.CREATE) {
                res = await this.props.createDataset(datasetData, selectedFiles, validMetadata);
            } else if (action === CRUD_ACTIONS.EDIT) {
                res = await this.props.updateDataset(editId, datasetData, selectedFiles, validMetadata);
            }

            if (res && res.success) {
                this.showNotification(res.message, 'success');
                this.handleCancel();
            } else {
                this.showNotification(res?.message || 'Có lỗi xảy ra', 'error');
            }
        } catch (error) {
            this.showNotification('Server error!', 'error');
        }
    }

    handleEdit = (dataset) => {
        this.setState({
            title: dataset.title,
            description: dataset.description,
            category_code: dataset.category_code,
            format_code: dataset.format_code,
            api_url: dataset.api_url || '',
            basicPrice: dataset.basicPrice || 0,
            standardPrice: dataset.standardPrice || 0,
            premiumPrice: dataset.premiumPrice || 0,
            status_code: dataset.status_code,
            existingFiles: dataset.files || [],
            metadata: dataset.metadata && dataset.metadata.length > 0
                ? dataset.metadata.map(m => ({ key: m.key, value: m.value }))
                : [{ key: '', value: '' }],
            selectedFiles: [],
            action: CRUD_ACTIONS.EDIT,
            editId: dataset.id
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc muốn xóa dataset này? Tất cả files sẽ bị xóa.')) {
            const res = await this.props.deleteDataset(id);
            if (res && res.success) {
                this.showNotification(res.message, 'success');
            } else {
                this.showNotification(res?.message || 'Xóa thất bại', 'error');
            }
        }
    }

    handleCancel = () => {
        const { categoryArr, formatArr, statusArr } = this.state;
        this.setState({
            title: '',
            description: '',
            category_code: categoryArr && categoryArr.length > 0 ? categoryArr[0].key : '',
            format_code: formatArr && formatArr.length > 0 ? formatArr[0].key : '',
            status_code: statusArr && statusArr.length > 0 ? statusArr[0].key : '',
            api_url: '',
            basicPrice: 0,
            standardPrice: 0,
            premiumPrice: 0,
            selectedFiles: [],
            existingFiles: [],
            metadata: [{ key: '', value: '' }],
            action: CRUD_ACTIONS.CREATE,
            editId: ''
        });
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

    render() {
        const { datasets, categoryArr, formatArr, title, description, category_code,
            format_code, api_url, basicPrice, standardPrice, premiumPrice,
            selectedFiles, existingFiles, metadata, action, notification, notificationType } = this.state;
        const { language } = this.props;

        return (
            <div className="data-manage-container">
                <div className="title">Quản lý Dataset</div>

                <div className="data-manage-body">
                    <div className="container">
                        <div className="row">
                            <div className="col-12 my-3">
                                <h5>{action === CRUD_ACTIONS.CREATE ? 'Thêm Dataset mới' : 'Chỉnh sửa Dataset'}</h5>
                            </div>

                            <div className="col-6">
                                <label>Tiêu đề <span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={title}
                                    onChange={(e) => this.onChangeInput(e, 'title')}
                                    placeholder="Nhập tiêu đề dataset"
                                />
                            </div>

                            <div className="col-3">
                                <label>Danh mục <span className="text-danger">*</span></label>
                                <select
                                    className="form-control"
                                    value={category_code}
                                    onChange={(e) => this.onChangeInput(e, 'category_code')}>
                                    {categoryArr && categoryArr.map((item, index) => (
                                        <option key={index} value={item.key}>
                                            {language === LANGUAGES.VI ? item.valueVi : item.valueEn}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-3">
                                <label>Định dạng <span className="text-danger">*</span></label>
                                <select
                                    className="form-control"
                                    value={format_code}
                                    onChange={(e) => this.onChangeInput(e, 'format_code')}>
                                    {formatArr && formatArr.map((item, index) => (
                                        <option key={index} value={item.key}>
                                            {language === LANGUAGES.VI ? item.valueVi : item.valueEn}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-12">
                                <label>Mô tả <span className="text-danger">*</span></label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    value={description}
                                    onChange={(e) => this.onChangeInput(e, 'description')}
                                    placeholder="Nhập mô tả chi tiết về dataset"
                                />
                            </div>

                            {/* FILE UPLOAD SECTION */}
                            <div className="col-12 mt-3">
                                <label>Upload Files (CSV, JSON, XML, Excel, PDF)</label>
                                <div className="file-upload-section">
                                    <input
                                        type="file"
                                        multiple
                                        accept=".csv,.json,.xml,.xlsx,.xls,.txt,.pdf"
                                        onChange={this.handleFileSelect}
                                        className="form-control"
                                    />

                                    {/* Show existing files (when editing) */}
                                    {action === CRUD_ACTIONS.EDIT && existingFiles.length > 0 && (
                                        <div className="existing-files mt-2">
                                            <h6>Files hiện tại:</h6>
                                            {existingFiles.map(file => (
                                                <div key={file.id} className="file-item">
                                                    <span>📄 {file.file_name}</span>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => this.handleDeleteExistingFile(file.id)}>
                                                        Xóa
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Show selected files */}
                                    {selectedFiles.length > 0 && (
                                        <div className="selected-files mt-2">
                                            <h6>Files mới được chọn:</h6>
                                            {selectedFiles.map((file, index) => (
                                                <div key={index} className="file-item new-file">
                                                    <span>📄 {file.name} ({(file.size / 1024).toFixed(2)} KB)</span>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => this.removeSelectedFile(index)}>
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="col-12 mt-3">
                                <label>API URL</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={api_url}
                                    onChange={(e) => this.onChangeInput(e, 'api_url')}
                                    placeholder="https://api.example.com/..."
                                />
                            </div>

                            {/* METADATA SECTION */}
                            <div className="col-12 mt-3">
                                <div className="metadata-header">
                                    <label className="mb-0">Metadata (Thông tin bổ sung)</label>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-success"
                                        onClick={this.addMetadata}>
                                        + Thêm metadata
                                    </button>
                                </div>
                                {metadata.map((item, index) => (
                                    <div key={index} className="row mb-2 align-items-center metadata-row">
                                        <div className="col-5">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Key (VD: author, license...)"
                                                value={item.key}
                                                onChange={(e) => this.onChangeMetadata(index, 'key', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-5">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Value"
                                                value={item.value}
                                                onChange={(e) => this.onChangeMetadata(index, 'value', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-2">
                                            {metadata.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-danger w-100"
                                                    onClick={() => this.removeMetadata(index)}>
                                                    Xóa
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="col-4">
                                <label>Giá cơ bản (VNĐ)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={basicPrice}
                                    onChange={(e) => this.onChangeInput(e, 'basicPrice')}
                                    placeholder="0"
                                    min="0"
                                />
                            </div>

                            <div className="col-4">
                                <label>Giá tiêu chuẩn (VNĐ)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={standardPrice}
                                    onChange={(e) => this.onChangeInput(e, 'standardPrice')}
                                    placeholder="0"
                                    min="0"
                                />
                            </div>

                            <div className="col-4">
                                <label>Giá cao cấp (VNĐ)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={premiumPrice}
                                    onChange={(e) => this.onChangeInput(e, 'premiumPrice')}
                                    placeholder="0"
                                    min="0"
                                />
                            </div>

                            {notification &&
                                <div className={`col-12 my-2 text-center ${notificationType === 'success' ? 'text-success' : 'text-danger'}`}>
                                    {notification}
                                </div>
                            }

                            <div className="col-12 my-3">
                                <button
                                    className={action === CRUD_ACTIONS.EDIT ? "btn btn-warning mr-2" : "btn btn-primary mr-2"}
                                    onClick={this.handleSave}>
                                    {action === CRUD_ACTIONS.EDIT ? 'Cập nhật' : 'Tạo mới'}
                                </button>
                                {action === CRUD_ACTIONS.EDIT &&
                                    <button className="btn btn-secondary" onClick={this.handleCancel}>
                                        Hủy
                                    </button>
                                }
                            </div>

                            {/* DATASET LIST TABLE */}
                            <div className="col-12">
                                <h5 className="my-3">Danh sách Dataset</h5>
                                <table className="table table-striped table-hover">
                                    <thead className="thead-dark">
                                        <tr>
                                            <th>Tiêu đề</th>
                                            <th>Danh mục</th>
                                            <th>Định dạng</th>
                                            <th>Files</th>
                                            <th>Metadata</th>
                                            <th>Giá cơ bản/tiêu chuẩn/cao cấp</th>
                                            <th>Trạng thái</th>
                                            <th>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {datasets && datasets.length > 0 ? (
                                            datasets.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{item.title}</td>
                                                    <td>{item.category ? (language === LANGUAGES.VI ? item.category.valueVi : item.category.valueEn) : ''}</td>
                                                    <td>{item.format ? (language === LANGUAGES.VI ? item.format.valueVi : item.format.valueEn) : ''}</td>
                                                    <td>
                                                        <span className="badge badge-info">
                                                            {item.files?.length || 0} files
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="badge badge-secondary">
                                                            {item.metadata?.length || 0} metadata
                                                        </span>
                                                    </td>
                                                    <td>{item.basicPrice || 0} / {item.standardPrice || 0} / {item.premiumPrice || 0}</td>
                                                    <td>{this.getStatusBadge(item.status_code)}</td>
                                                    <td>
                                                        {item.status_code !== 'APPROVED' && (
                                                            <>
                                                                <button
                                                                    className="btn btn-sm btn-warning mr-1"
                                                                    onClick={() => this.handleEdit(item)}>
                                                                    <i className="fa-solid fa-pencil"></i>
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-danger"
                                                                    onClick={() => this.handleDelete(item.id)}>
                                                                    <i className="fa-solid fa-trash"></i>
                                                                </button>
                                                            </>
                                                        )}
                                                        {item.status_code === 'APPROVED' && (
                                                            <span className="text-muted">Đã duyệt</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className="text-center">Chưa có dataset nào</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
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
    createDataset: (data, files, metadata) => dispatch(actions.createDataset(data, files, metadata)),
    updateDataset: (id, data, files, metadata) => dispatch(actions.updateDataset(id, data, files, metadata)),
    deleteDataset: (id) => dispatch(actions.deleteDataset(id)),
    deleteFile: (fileId) => dispatch(actions.deleteFile(fileId)),
    getCategoryStart: () => dispatch(actions.fetchCategoryStart()),
    getFormatStart: () => dispatch(actions.fetchFormatStart()),
    getStatusStart: () => dispatch(actions.fetchStatusStart())
});

export default connect(mapStateToProps, mapDispatchToProps)(DataManage);