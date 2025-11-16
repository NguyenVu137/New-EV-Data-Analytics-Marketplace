import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from "connected-react-router";

import * as actions from "../../store/actions";

import './Login.scss';
import { FormattedMessage } from 'react-intl';
import { handleLoginApi } from '../../services/userService';


class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            isShowPassword: false,
            errMessage: ''
        }
    }

    componentDidMount() {
        // Nếu đã login rồi, redirect dựa theo role
        if (this.props.isLoggedIn) {
            // Check if user has admin role (roleId === 'R1' or roleId === 1)
            if (this.props.userInfo && this.props.userInfo.user && (this.props.userInfo.user.roleId === 'R1' || this.props.userInfo.user.roleId === 1)) {
                this.props.navigate('/system/user-manage');
            } else {
                this.props.navigate('/home');
            }
        }
    }
 
    handleOnChangeUsername = (event) => {
        this.setState({
            username: event.target.value
        })
    }

    handleOnChangePassword = (event) => {
        this.setState({
            password: event.target.value
        })
    }

    handleLogin = async () => {
        this.setState({
            errMessage: ''
        })

        try {
            let data = await handleLoginApi(this.state.username, this.state.password);
            console.log('📱 1. Login API response:', JSON.stringify(data, null, 2));
            
            if (data && data.errCode !== 0) {
                this.setState({
                    errMessage: data.message
                })
            }
            if (data && data.errCode === 0) {
                console.log('✅ 2. Login success! Dispatching to Redux...');
                console.log('✅ 2a. User data:', JSON.stringify(data.user, null, 2));
                console.log('✅ 2b. User roleId:', data.user?.roleId, '| Type:', typeof data.user?.roleId);
                
                // Dispatch to Redux FIRST
                this.props.userLoginSuccess(data);
                console.log('✅ 3. Dispatched userLoginSuccess');
                
                // Check Redux state immediately (might not be updated yet)
                console.log('✅ 4. Redux props immediately after dispatch:', {
                    isLoggedIn: this.props.isLoggedIn,
                    userInfo: this.props.userInfo
                });
                
                // Wait for Redux state to update
                setTimeout(() => {
                    const currentState = this.props.userInfo;
                    const roleId = currentState?.user?.roleId;
                    
                    console.log('✅ 5. Redux state after 500ms wait:', JSON.stringify(currentState, null, 2));
                    console.log('✅ 5a. Retrieved roleId:', roleId, '| Type:', typeof roleId);
                    
                    // Determine redirect path based on user role
                    let redirectPath = '/home'; // default path for regular users
                    
                    console.log('✅ 6. Checking role...');
                    console.log('   - roleId === 1 ?', roleId === 1);
                    console.log('   - roleId === "R1" ?', roleId === 'R1');
                    
                    if (roleId === 1 || roleId === 'R1') {
                        redirectPath = '/system/user-manage';
                        console.log('✅ 7. ADMIN ROLE DETECTED! Redirecting to:', redirectPath);
                    } else {
                        console.log('✅ 7. Regular user. Redirecting to:', redirectPath);
                    }
                    
                    // Check if there's a pending purchase
                    const pendingPurchase = sessionStorage.getItem('pendingPurchase');
                    if (pendingPurchase) {
                        const { datasetId, packageType } = JSON.parse(pendingPurchase);
                        sessionStorage.removeItem('pendingPurchase');
                        console.log('💳 Pending purchase found, redirecting to payment');
                        this.props.navigate(`/payment/${datasetId}?package=${packageType}`);
                    } else {
                        console.log('➡️ 8. Final redirect to:', redirectPath);
                        this.props.navigate(redirectPath);
                    }
                }, 500);
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            if (error.response) {
                if (error.response.data) {
                    this.setState({
                        errMessage: error.response.data.message
                    })
                }
            }
        }
    }

    handleShowHidePassword = () => {
        this.setState({
            isShowPassword: !this.state.isShowPassword
        })
    }

    handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.keyCode === 13) {
            this.handleLogin();
        }
    }
    render() {
        //JSX


        return (
            <div className="login-background">
                <div className="login-container">
                    <div className="login-content row">
                        <div className="col-12 text-login">Login</div>
                        <div className="col-12 form-group login-input">
                            <label>Username:</label>
                            <input type="text" className="form-control" placeholder="Enter your username"
                                value={this.state.username}
                                onChange={(event => this.handleOnChangeUsername(event))} />
                        </div>
                        <div className="col-12 form-group login-input">
                            <label>Password:</label>
                            <div className="custom-input-password">
                                <input type={this.state.isShowPassword ? 'text' : 'password'} className="form-control" placeholder="Enter your password"
                                    value={this.state.password}
                                    onChange={(event => this.handleOnChangePassword(event))}
                                    onKeyDown={(event) => this.handleKeyDown(event)}
                                />
                                <span
                                    onClick={() => { this.handleShowHidePassword() }}
                                ><i className={this.state.isShowPassword ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'}></i>
                                </span>
                            </div>
                        </div>
                        <div className='col-12' style={{ color: 'red' }}>
                            {this.state.errMessage}
                        </div>
                        <div className="col-12 ">
                            <button className="btn-login" onClick={() => { this.handleLogin() }}>Login</button>
                        </div>
                        <div className="col-12">
                            <span className="forgot-password">Forgot your password?</span>
                            <div>
                                <div className="col-12 text-center mt-3">
                                    <span className="text-other-login">Or Login with:</span>
                                </div>
                                <div className="col-12 social-login">
                                    <i className="fa-brands fa-google-plus-g google"></i>
                                    <i className="fa-brands fa-facebook-f facebook"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        language: state.app.language,
        isLoggedIn: state.user?.isLoggedIn,
        userInfo: state.user?.userInfo
    };
};

const mapDispatchToProps = dispatch => {
    return {
        navigate: (path) => dispatch(push(path)),
        // userLoginFail: () => dispatch(actions.adminLoginFail()),
        userLoginSuccess: (userInfor) => dispatch(actions.userLoginSuccess(userInfor))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
