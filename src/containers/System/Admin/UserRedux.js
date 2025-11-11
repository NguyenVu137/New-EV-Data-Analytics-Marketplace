import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { LANGUAGES, CRUD_ACTIONS, CommonUtils } from '../../../utils';
import * as actions from "../../../store/actions";
import './UserRedux.scss';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import TableManageUser from './TableManageUser';

class UserRedux extends Component {
    constructor(props) {
        super(props);
        this.state = {
            genderArr: [],
            roleArr: [],
            previewImgURL: '',
            isOpen: false,
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            phoneNumber: '',
            address: '',
            gender: '',
            role: '',
            avatar: '',
            action: CRUD_ACTIONS.CREATE,
            userEditId: '',
            notification: '',
            notificationType: ''
        }
    }

    componentDidMount() {
        this.props.getGenderStart();
        this.props.getRoleStart();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.genderRedux !== this.props.genderRedux) {
            const genders = this.props.genderRedux;
            this.setState({
                genderArr: genders,
                gender: genders && genders.length > 0 ? genders[0].key : ''
            });
        }

        if (prevProps.roleRedux !== this.props.roleRedux) {
            const roles = this.props.roleRedux;
            this.setState({
                roleArr: roles,
                role: roles && roles.length > 0 ? roles[0].key : ''
            });
        }

        if (prevProps.listUsers !== this.props.listUsers) {
            const genders = this.props.genderRedux;
            const roles = this.props.roleRedux;
            this.setState({
                email: '',
                password: '',
                firstName: '',
                lastName: '',
                phoneNumber: '',
                address: '',
                gender: genders && genders.length > 0 ? genders[0].key : '',
                role: roles && roles.length > 0 ? roles[0].key : '',
                avatar: '',
                previewImgURL: '',
                action: CRUD_ACTIONS.CREATE,
                userEditId: '',
                notification: '',
                notificationType: ''
            });
        }
    }

    handleOnchangeImage = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const base64 = await CommonUtils.getBase64(file);
            const objectUrl = URL.createObjectURL(file);
            this.setState({
                previewImgURL: objectUrl,
                avatar: base64
            });
        }
    }

    openPreviewImage = () => {
        if (!this.state.previewImgURL) return;
        this.setState({ isOpen: true });
    }

    onChangeInput = (event, id) => {
        this.setState({ [id]: event.target.value });
    }

    checkValidateInput = () => {
        const arrCheck = ['email', 'password', 'firstName', 'lastName', 'phoneNumber', 'address'];
        for (let i = 0; i < arrCheck.length; i++) {
            if (!this.state[arrCheck[i]]) {
                this.setState({
                    notification: `Input is required: ${arrCheck[i]}`,
                    notificationType: 'error'
                });
                setTimeout(() => this.setState({ notification: '', notificationType: '' }), 3000);
                return false;
            }
        }
        return true;
    }

    handleSaveUser = async () => {
        if (!this.checkValidateInput()) return;

        const { action, userEditId, email, password, firstName, lastName, phoneNumber, address, gender, role, avatar } = this.state;
        const userData = { email, password, firstName, lastName, phoneNumber, address, gender, role, avatar };

        try {
            let res;
            if (action === CRUD_ACTIONS.CREATE) {
                res = await this.props.createNewUser(userData);
            } else if (action === CRUD_ACTIONS.EDIT) {
                res = await this.props.editUserRedux({ id: userEditId, ...userData });
            }

            if (res && res.success) {
                this.setState({
                    notification: action === CRUD_ACTIONS.CREATE ? 'Tạo người dùng thành công' : 'Cập nhật người dùng thành công',
                    notificationType: 'success'
                });
                this.props.fetchUserRedux(); // load lại danh sách
            } else {
                this.setState({
                    notification: res.message || 'Có lỗi xảy ra',
                    notificationType: 'error'
                });
            }
        } catch (error) {
            this.setState({
                notification: 'Server error!',
                notificationType: 'error'
            });
        }

        setTimeout(() => this.setState({ notification: '', notificationType: '' }), 3000);
    }

    handleEditUserFromParent = (user) => {
        let imageBase64 = '';
        if (user.image) {
            imageBase64 = new Buffer(user.image, 'base64').toString('binary');
        }
        this.setState({
            email: user.email,
            password: 'user.password',
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phonenumber,
            address: user.address,
            gender: user.gender,
            role: user.roleId,
            avatar: imageBase64,
            previewImgURL: imageBase64,
            action: CRUD_ACTIONS.EDIT,
            userEditId: user.id
        });
    }

    render() {
        const { genderArr, roleArr, previewImgURL, isOpen, email, password, firstName, lastName, phoneNumber, address, gender, role, notification, notificationType } = this.state;
        const { language, isLoadingGender } = this.props;

        return (
            <div className="user-redux-container">
                <div className="title">User Redux</div>
                <div className="user-redux-body">
                    <div className="container">
                        <div className="row">
                            <div className="col-12 my-3"><FormattedMessage id="manage-user.add" /></div>
                            <div className="col-12">{isLoadingGender ? 'Loading genders...' : ''}</div>

                            <div className="col-3">
                                <label><FormattedMessage id="manage-user.email" /></label>
                                <input type="email" className="form-control"
                                    value={email}
                                    onChange={(e) => this.onChangeInput(e, 'email')}
                                    disabled={this.state.action === CRUD_ACTIONS.EDIT}
                                />
                            </div>

                            <div className="col-3">
                                <label><FormattedMessage id="manage-user.password" /></label>
                                <input type="password" className="form-control"
                                    value={password}
                                    onChange={(e) => this.onChangeInput(e, 'password')}
                                    disabled={this.state.action === CRUD_ACTIONS.EDIT}
                                />
                            </div>

                            <div className="col-3">
                                <label><FormattedMessage id="manage-user.first-name" /></label>
                                <input type="text" className="form-control"
                                    value={firstName}
                                    onChange={(e) => this.onChangeInput(e, 'firstName')}
                                />
                            </div>

                            <div className="col-3">
                                <label><FormattedMessage id="manage-user.last-name" /></label>
                                <input type="text" className="form-control"
                                    value={lastName}
                                    onChange={(e) => this.onChangeInput(e, 'lastName')}
                                />
                            </div>

                            <div className="col-3">
                                <label><FormattedMessage id="manage-user.phone-number" /></label>
                                <input type="text" className="form-control"
                                    value={phoneNumber}
                                    onChange={(e) => this.onChangeInput(e, 'phoneNumber')}
                                />
                            </div>

                            <div className="col-9">
                                <label><FormattedMessage id="manage-user.address" /></label>
                                <input type="text" className="form-control"
                                    value={address}
                                    onChange={(e) => this.onChangeInput(e, 'address')}
                                />
                            </div>

                            <div className="col-3">
                                <label><FormattedMessage id="manage-user.gender" /></label>
                                <select className="form-control"
                                    value={gender}
                                    onChange={(e) => this.onChangeInput(e, 'gender')}>
                                    {genderArr.map((item, index) => (
                                        <option key={index} value={item.key}>
                                            {language === LANGUAGES.VI ? item.valueVi : item.valueEn}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-3">
                                <label><FormattedMessage id="manage-user.role" /></label>
                                <select className="form-control"
                                    value={role}
                                    onChange={(e) => this.onChangeInput(e, 'role')}>
                                    {roleArr.map((item, index) => (
                                        <option key={index} value={item.key}>
                                            {language === LANGUAGES.VI ? item.valueVi : item.valueEn}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-3">
                                <label><FormattedMessage id="manage-user.image" /></label>
                                <div className="preview-img-container">
                                    <input type="file" hidden id="previewImg"
                                        onChange={(e) => this.handleOnchangeImage(e)} />
                                    <label htmlFor="previewImg" className="label-upload">
                                        Tải ảnh <i className="fas fa-upload"></i>
                                    </label>
                                    <div className="preview-image"
                                        style={{ backgroundImage: `url(${previewImgURL})` }}
                                        onClick={this.openPreviewImage}>
                                    </div>
                                </div>
                            </div>

                            {notification &&
                                <div className={`col-12 my-2 text-center ${notificationType === 'success' ? 'text-success' : 'text-danger'}`}>
                                    {notification}
                                </div>
                            }

                            <div className="col-12 my-3">
                                <button className={this.state.action === CRUD_ACTIONS.EDIT ? "btn btn-warning" : "btn btn-outline-info"}
                                    onClick={this.handleSaveUser}>
                                    {this.state.action === CRUD_ACTIONS.EDIT ? <FormattedMessage id="manage-user.edit" /> : <FormattedMessage id="manage-user.save" />}
                                </button>
                            </div>

                            <div className="col-12 mb-5">
                                <TableManageUser handleEditUserFromParent={this.handleEditUserFromParent} action={this.state.action} />
                            </div>

                        </div>
                    </div>
                </div>

                {isOpen &&
                    <Lightbox mainSrc={previewImgURL} onCloseRequest={() => this.setState({ isOpen: false })} />
                }
            </div>
        )
    }
}

const mapStateToProps = state => ({
    language: state.app.language,
    genderRedux: state.admin.genders,
    roleRedux: state.admin.roles,
    isLoadingGender: state.admin.isLoadingGender,
    listUsers: state.admin.users
});

const mapDispatchToProps = dispatch => ({
    getGenderStart: () => dispatch(actions.fetchGenderStart()),
    getRoleStart: () => dispatch(actions.fetchRoleStart()),
    createNewUser: (data) => dispatch(actions.createNewUser(data)),
    editUserRedux: (data) => dispatch(actions.editUser(data)),
    fetchUserRedux: () => dispatch(actions.fetchAllUsersStart())
});

export default connect(mapStateToProps, mapDispatchToProps)(UserRedux);
