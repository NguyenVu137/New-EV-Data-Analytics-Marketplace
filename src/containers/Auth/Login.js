import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from "connected-react-router";
import { handleLoginApi } from '../../services/userService';
import * as actions from "../../store/actions";
import './Login.scss';

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            isShowPassword: false,
            errMessage: ''
        };
    }

    handleOnChangeEmail = (event) => {
        this.setState({ email: event.target.value });
    }

    handleOnChangePassword = (event) => {
        this.setState({ password: event.target.value });
    }

    handleShowHidePassword = () => {
        this.setState({ isShowPassword: !this.state.isShowPassword });
    }

    handleLogin = async () => {
        this.setState({ errMessage: '' });

        const { email, password } = this.state;
        if (!email || !password) {
            this.setState({ errMessage: 'Please enter email and password' });
            return;
        }

        try {
            const data = await handleLoginApi(email, password);
            if (data && data.errCode !== 0) {
                this.setState({ errMessage: data.errMessage || data.message });
            }
            if (data && data.errCode === 0) {
                this.props.userLoginSuccess(data);
                localStorage.setItem('token', data.token);
                // Redirect theo role
                const role = data.user.roleId;
                switch (role) {
                    case 'R1': this.props.navigate('/system/user-manage'); break;
                    case 'R2': this.props.navigate('/provider'); break;
                    case 'R3': this.props.navigate('/home'); break;
                    default: this.props.navigate('/'); break;
                }
            }
        } catch (error) {
            this.setState({
                errMessage: error.response?.data?.message || 'Server error'
            });
        }
    }

    render() {
        const { email, password, isShowPassword, errMessage } = this.state;
        return (
            <div className="login-background">
                <div className="login-container">
                    <div className="login-content row">
                        <div className="col-12 text-login">Login</div>

                        <div className="col-12 form-group login-input">
                            <label>Email:</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter your email"
                                value={email}
                                onChange={this.handleOnChangeEmail}
                            />
                        </div>

                        <div className="col-12 form-group login-input">
                            <label>Password:</label>
                            <div className="custom-input-password">
                                <input
                                    type={isShowPassword ? 'text' : 'password'}
                                    className="form-control"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={this.handleOnChangePassword}
                                />
                                <span onClick={this.handleShowHidePassword}>
                                    <i className={isShowPassword ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'}></i>
                                </span>
                            </div>
                        </div>

                        {errMessage && <div className='col-12 text-danger'>{errMessage}</div>}

                        <div className="col-12">
                            <button className="btn-login" onClick={this.handleLogin}>Login</button>
                        </div>

                        {/* Link đăng ký */}
                        <div className="col-12 mt-3 text-center">
                            <span>Don't have an account? </span>
                            <span
                                className="text-primary"
                                style={{ cursor: 'pointer' }}
                                onClick={() => this.props.navigate('/register')}
                            >
                                Register
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}

const mapStateToProps = state => ({
    language: state.app.language
});

const mapDispatchToProps = dispatch => ({
    navigate: (path) => dispatch(push(path)),
    userLoginSuccess: (userInfor) => dispatch(actions.userLoginSuccess(userInfor))
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
