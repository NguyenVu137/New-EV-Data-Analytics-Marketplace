import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import './Register.scss'
import { userRegister } from '../../store/actions/userActions'
class Register extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            address: '',
            phoneNumber: '',
            gender: '',
            role: '',
            image: null,
            imagePreview: null,
            isShowPassword: false,
            errMessage: ''
        };
    }

    handleOnChangeInput = (event, id) => {
        let copyState = { ...this.state };
        copyState[id] = event.target.value;
        this.setState({
            ...copyState
        });
    }

    handleShowHidePassword = () => {
        this.setState({
            isShowPassword: !this.state.isShowPassword
        });
    }

    handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            this.setState({
                image: file,
                imagePreview: URL.createObjectURL(file)
            });
        }
    }

    handleRemoveImage = () => {
        this.setState({
            image: null,
            imagePreview: null
        });
    }

    handleRegister = async () => {
        this.setState({ errMessage: '' });

        const { email, password, firstName, lastName, address, phoneNumber, gender, role, image } = this.state;

        // --- 1. Kiểm tra dữ liệu đầu vào ---
        if (!email || !password || !firstName || !lastName || !address || !phoneNumber || !gender || !role) {
            this.setState({ errMessage: 'Please fill in all required fields!' });
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.setState({ errMessage: 'Please enter a valid email address!' });
            return;
        }

        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(phoneNumber)) {
            this.setState({ errMessage: 'Please enter a valid phone number (10–11 digits)!' });
            return;
        }

        if (password.length < 6) {
            this.setState({ errMessage: 'Password must be at least 6 characters!' });
            return;
        }

        // --- 2. Tạo object user để gửi đi ---
        const userData = {
            email,
            password,
            firstName,
            lastName,
            address,
            phoneNumber,
            gender,
            role: role,
            image: image || null
        };
        console.log('Register payload:', userData);

        try {
            const res = await this.props.userRegister(userData);

            if (res && res.errCode === 0) {
                alert('Đăng ký thành công!');
                this.props.navigate('/login');
            } else {
                this.setState({
                    errMessage: res?.message || res?.errMessage || 'Đăng ký thất bại!'
                });
            }
        } catch (error) {
            console.error('Register error:', error);
            this.setState({
                errMessage: error.response?.data?.message || 'Server error!'
            });
        }
    };

    handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.keyCode === 13) {
            this.handleRegister();
        }
    };


    render() {
        return (
            <div className="register-background">
                <div className="register-container">
                    <div className="register-content row">
                        <div className="col-12 text-register">Đăng Ký Tài Khoản</div>
                        <div className="col-12 register-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Họ</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Nhập họ"
                                        value={this.state.firstName}
                                        onChange={(event) => this.handleOnChangeInput(event, 'firstName')}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Tên</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Nhập tên"
                                        value={this.state.lastName}
                                        onChange={(event) => this.handleOnChangeInput(event, 'lastName')}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="Nhập email"
                                    value={this.state.email}
                                    onChange={(event) => this.handleOnChangeInput(event, 'email')}
                                />
                            </div>

                            <div className="form-group">
                                <label>Mật khẩu</label>
                                <div className="custom-input-password">
                                    <input
                                        type={this.state.isShowPassword ? 'text' : 'password'}
                                        className="form-control"
                                        placeholder="Nhập mật khẩu"
                                        value={this.state.password}
                                        onChange={(event) => this.handleOnChangeInput(event, 'password')}
                                        onKeyDown={(event) => this.handleKeyDown(event)}
                                    />
                                    <span onClick={() => this.handleShowHidePassword()}>
                                        <i className={this.state.isShowPassword ? 'far fa-eye' : 'far fa-eye-slash'}></i>
                                    </span>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Địa chỉ</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Nhập địa chỉ"
                                    value={this.state.address}
                                    onChange={(event) => this.handleOnChangeInput(event, 'address')}
                                />
                            </div>

                            <div className="form-group">
                                <label>Số điện thoại</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Nhập số điện thoại"
                                    value={this.state.phoneNumber}
                                    onChange={(event) => this.handleOnChangeInput(event, 'phoneNumber')}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Giới tính</label>
                                    <select
                                        className="form-control"
                                        value={this.state.gender}
                                        onChange={(event) => this.handleOnChangeInput(event, 'gender')}
                                    >
                                        <option value="">Chọn giới tính</option>
                                        <option value="M">Nam</option>
                                        <option value="F">Nữ</option>
                                        <option value="O">Khác</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Vai trò</label>
                                    <select
                                        className="form-control"
                                        value={this.state.role}
                                        onChange={(event) => this.handleOnChangeInput(event, 'role')}
                                    >
                                        <option value="">Chọn vai trò</option>
                                        <option value="R1">Admin</option>
                                        <option value="R2">Provider</option>
                                        <option value="R3">Consumer</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Ảnh đại diện</label>
                                <div className="image-upload">
                                    <label htmlFor="file-input" className="upload-label">
                                        <i className="fas fa-cloud-upload-alt"></i>
                                        <span>Chọn ảnh để tải lên</span>
                                    </label>
                                    <input
                                        id="file-input"
                                        type="file"
                                        accept="image/*"
                                        onChange={this.handleImageChange}
                                    />
                                    {this.state.imagePreview && (
                                        <div className="image-preview">
                                            <img src={this.state.imagePreview} alt="Preview" />
                                            <div className="remove-image" onClick={this.handleRemoveImage}>
                                                <i className="fas fa-times"></i> Xóa ảnh
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="col-12" style={{ color: 'red', marginBottom: '10px' }}>
                                {this.state.errMessage}
                            </div>

                            <button
                                className="btn-register"
                                onClick={() => this.handleRegister()}
                            >
                                Đăng Ký
                            </button>

                            <div className="login-redirect">
                                Đã có tài khoản?
                                <a href="/login">Đăng nhập ngay</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        language: state.app.language
    };
};

const mapDispatchToProps = (dispatch) => ({
    userRegister: (userData) => dispatch(userRegister(userData)).then(res => res)
});

export default connect(mapStateToProps, mapDispatchToProps)(Register);