import React, { Component } from 'react';
import { connect } from 'react-redux';
import './HomeHeader.scss';
import { FormattedMessage } from 'react-intl';
import { LANGUAGES } from '../../utils';
import { changeLanguageApp } from '../../store/actions/appActions';
import { processLogout } from '../../store/actions/userActions';
import { withRouter } from 'react-router-dom';
class HomeHeader extends Component {

    changeLanguage = (language) => {
        this.props.changeLanguageAppRedux(language)
        //fire redux event : actions
    }
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
    render() {
        const { userInfo } = this.props;
        let language = this.props.language;
        return (
            <React.Fragment>
                <div className="home-header-container">
                    <div className="home-header-content">
                        <div className="left-content">
                            <i className="fa-solid fa-bars"></i>
                            <img src="" />
                            <div className="header-logo"></div>
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
                            <div className="child-content">
                                <div><b><FormattedMessage id="homeheader.homepage" /></b></div>
                                <div></div>
                            </div>
                            <div className="child-content">
                                <div><b><FormattedMessage id="homeheader.datalist" /></b></div>
                                <div></div>
                            </div>
                            <div className="child-content">
                                <div><b><FormattedMessage id="homeheader.provider" /></b></div>
                                <div></div>
                            </div>
                            <div className="child-content">
                                <div><b><FormattedMessage id="homeheader.about" /></b></div>
                                <div></div>
                            </div>
                        </div>
                        <div className="right-content">
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
                            <div className="support"><i className="fa-solid fa-circle-question"></i><FormattedMessage id="homeheader.support" /></div>
                            <div className={language === LANGUAGES.VI ? 'language-vi active' : 'language-vi'}><span onClick={() => this.changeLanguage(LANGUAGES.VI)}>VN</span></div>
                            <div className={language === LANGUAGES.EN ? 'language-en active' : 'language-en'}><span onClick={() => this.changeLanguage(LANGUAGES.EN)}>EN</span></div>
                        </div>
                    </div>
                </div>
                <div className="home-header-banner">
                    <div className="content-up">
                        <div className="title1"><FormattedMessage id="banner.title1" /></div>
                        <div className="title2"><FormattedMessage id="banner.title2" /></div>
                        <div className="search">
                            <i className="fa-solid fa-magnifying-glass"></i>
                            <input type="text" placeholder='Tìm kiếm dữ liệu' />
                        </div>
                    </div>
                    <div className="content-down">
                        <div className="options">
                            <div className="option-child">
                                <div className="icon-child"><i className="fa-solid fa-car"></i></div>
                                <div className="text-child"><FormattedMessage id="banner.child1" /></div>
                            </div>
                            <div className="option-child">
                                <div className="icon-child"><i className="fa-solid fa-battery-three-quarters"></i></div>
                                <div className="text-child"><FormattedMessage id="banner.child2" /></div>
                            </div>
                            <div className="option-child">
                                <div className="icon-child"><i className="fa-solid fa-earth-americas"></i></div>
                                <div className="text-child"><FormattedMessage id="banner.child3" /></div>
                            </div>
                            <div className="option-child">
                                <div className="icon-child"><i className="fa-solid fa-building"></i></div>
                                <div className="text-child"><FormattedMessage id="banner.child4" /></div>
                            </div>
                            <div className="option-child">
                                <div className="icon-child"><i className="fa-solid fa-bolt"></i></div>
                                <div className="text-child"><FormattedMessage id="banner.child5" /></div>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
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
        changeLanguageAppRedux: (language) => dispatch(changeLanguageApp(language))
    };
};

export default withRouter(connect(mapStateToProps, {
    changeLanguageAppRedux: changeLanguageApp,
    processLogout
})(HomeHeader));