import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { LANGUAGES } from '../utils';
import { changeLanguageApp } from '../store/actions/appActions';
import { processLogout } from '../store/actions/userActions';
import './Navbar.scss';

class Navbar extends Component {

    changeLanguage = (language) => {
        this.props.changeLanguageAppRedux(language);
    }

    goToMyPurchases = () => {
        this.props.history.push('/my-purchases');
    };

    goToAnalytics = () => {
        this.props.history.push('/ev-analytics');
    };

    handleLogout = () => {
        this.props.processLogout();
        this.props.history.push('/home');
    }

    handleLogin = () => {
        this.props.history.push('/login');
    }

    handleRegister = () => {
        this.props.history.push('/Register');
    }

    goToHome = () => {
        this.props.history.push('/home');
    };

    goToDataList = () => {
        this.props.history.push('/datasets');
    };

    goToProvider = () => {
        this.props.history.push('/providers');
    };

    goToAbout = () => {
        this.props.history.push('/about');
    };

    goToSupport = () => {
        this.props.history.push('/support');
    };

    render() {
        const { userInfo, language } = this.props;

        return (
            <div className="navbar-container">
                <div className="navbar-content">
                    <div className="left-content">
                        <i className="fa-solid fa-bars"></i>
                        <div
                            className="header-logo"
                            onClick={() => {
                                const { userInfo } = this.props;
                                if (userInfo?.user?.roleId === 'R1') {
                                    this.props.history.push('/system/user-redux');
                                } else if (userInfo?.user?.roleId === 'R2') {
                                    this.props.history.push('/system/manage-data');
                                } else {
                                    this.props.history.push('/home');
                                }
                            }}
                        ></div>
                        {userInfo?.user?.email && (
                            <span className='user-greeting'>
                                <FormattedMessage
                                    id="homeheader.welcome"
                                    values={{ name: userInfo.user.email.split('@')[0] }}
                                />
                            </span>
                        )}
                    </div>
                    <div className="center-content">
                        <div className="child-content" onClick={this.goToHome}>
                            <div><b><FormattedMessage id="homeheader.homepage" /></b></div>
                            <div></div>
                        </div>
                        <div className="child-content" onClick={this.goToDataList}>
                            <div><b><FormattedMessage id="homeheader.datalist" /></b></div>
                            <div></div>
                        </div>
                        <div className="child-content" onClick={this.goToProvider}>
                            <div><b><FormattedMessage id="homeheader.provider" /></b></div>
                            <div></div>
                        </div>
                        <div className="child-content" onClick={this.goToAbout}>
                            <div><b><FormattedMessage id="homeheader.about" /></b></div>
                            <div></div>
                        </div>
                    </div>
                    <div className="right-content">
                        {this.props.isLoggedIn && (
                            <>
                                <button className="btn-analytics" onClick={this.goToAnalytics}>
                                    <i className="fa-solid fa-chart-line"></i> Dashboard
                                </button>
                                <button className="btn-purchases" onClick={this.goToMyPurchases}>
                                    <i className="fa-solid fa-receipt"></i> Lịch sử mua
                                </button>
                            </>
                        )}
                        {this.props.isLoggedIn ? (
                            <button className="btn-logout" onClick={this.handleLogout}>
                                <FormattedMessage id="homeheader.logout" />
                            </button>
                        ) : (
                            <>
                                <button className="btn-login" onClick={this.handleLogin}>
                                    <FormattedMessage id="homeheader.login" />
                                </button>
                                <button className="btn-register" onClick={this.handleRegister}>
                                    <FormattedMessage id="homeheader.register" />
                                </button>
                            </>
                        )}
                        <div className="support" onClick={this.goToSupport}>
                            <i className="fa-solid fa-circle-question"></i>
                            <FormattedMessage id="homeheader.support" />
                        </div>
                        <div className={language === LANGUAGES.VI ? 'language-vi active' : 'language-vi'}>
                            <span onClick={() => this.changeLanguage(LANGUAGES.VI)}>VN</span>
                        </div>
                        <div className={language === LANGUAGES.EN ? 'language-en active' : 'language-en'}>
                            <span onClick={() => this.changeLanguage(LANGUAGES.EN)}>EN</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.user.isLoggedIn,
        userInfo: state.user.userInfo,
        language: state.app.language,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        changeLanguageAppRedux: (language) => dispatch(changeLanguageApp(language)),
        processLogout: () => dispatch(processLogout())
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Navbar));
