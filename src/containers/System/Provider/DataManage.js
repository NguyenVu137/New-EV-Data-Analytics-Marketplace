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

            title: '',
            description: '',
            category_code: '',
            format_code: '',
            file_url: '',
            api_url: '',
            basicPrice: 0,
            standardPrice: 0,
            premiumPrice: 0,

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
            file_url, api_url, basicPrice, standardPrice, premiumPrice } = this.state;

        const datasetData = {
            title,
            description,
            category_code,
            format_code,
            file_url,
            api_url,
            basicPrice: parseFloat(basicPrice) || 0,
            standardPrice: parseFloat(standardPrice) || 0,
            premiumPrice: parseFloat(premiumPrice) || 0,
            status_code: this.state.status_code
        };

        try {
            let res;
            if (action === CRUD_ACTIONS.CREATE) {
                res = await this.props.createDataset(datasetData);
            } else if (action === CRUD_ACTIONS.EDIT) {
                res = await this.props.updateDataset(editId, datasetData);
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
            file_url: dataset.file_url || '',
            api_url: dataset.api_url || '',
            basicPrice: dataset.basicPrice || 0,
            standardPrice: dataset.standardPrice || 0,
            premiumPrice: dataset.premiumPrice || 0,
            action: CRUD_ACTIONS.EDIT,
            editId: dataset.id
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc muốn xóa dataset này?')) {
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
            file_url: '',
            api_url: '',
            basicPrice: 0,
            standardPrice: 0,
            premiumPrice: 0,
            action: CRUD_ACTIONS.CREATE,
            editId: ''
        });
    }

    getStatusBadge = (status_code) => {
        const statusConfig = {
            'PENDING APPROVAL': { text: 'Chờ duyệt', class: 'badge-warning' },
            'APPROVED': { text: 'Đã duyệt', class: 'badge-success' },
            'REJECTED': { text: 'Từ chối', class: 'badge-danger' }
        };
        const config = statusConfig[status_code] || statusConfig['PENDING APPROVAL'];
        return <span className={`badge ${config.class}`}>{config.text}</span>;
    }

    render() {
        const { datasets, categoryArr, formatArr, title, description, category_code,
            format_code, file_url, api_url, basicPrice, standardPrice, premiumPrice,
            action, notification, notificationType } = this.state;
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

                            <div className="col-6">
                                <label>File URL</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={file_url}
                                    onChange={(e) => this.onChangeInput(e, 'file_url')}
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="col-6">
                                <label>API URL</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={api_url}
                                    onChange={(e) => this.onChangeInput(e, 'api_url')}
                                    placeholder="https://api.example.com/..."
                                />
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

                            <div className="col-12">
                                <h5 className="my-3">Danh sách Dataset</h5>
                                <table className="table table-striped table-hover">
                                    <thead className="thead-dark">
                                        <tr>
                                            <th>Tiêu đề</th>
                                            <th>Danh mục</th>
                                            <th>Định dạng</th>
                                            <th>Giá tải/Đăng ký</th>
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
                                                <td colSpan="6" className="text-center">Chưa có dataset nào</td>
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
    createDataset: (data) => dispatch(actions.createDataset(data)),
    updateDataset: (id, data) => dispatch(actions.updateDataset(id, data)),
    deleteDataset: (id) => dispatch(actions.deleteDataset(id)),
    getCategoryStart: () => dispatch(actions.fetchCategoryStart()),
    getFormatStart: () => dispatch(actions.fetchFormatStart()),
    getStatusStart: () => dispatch(actions.fetchStatusStart())
});

export default connect(mapStateToProps, mapDispatchToProps)(DataManage);