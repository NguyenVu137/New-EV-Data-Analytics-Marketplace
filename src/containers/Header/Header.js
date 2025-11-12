import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash'
import * as actions from "../../store/actions";
import Navigator from '../../components/Navigator';
import { adminMenu, providerMenu } from './menuApp';
import './Header.scss';
import { LANGUAGES, USER_ROLE } from "../../utils";
import { FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';


class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            MenuApp: []
        }
    }

    handleChangeLanguage = (language) => {
        this.props.changeLanguageAppRedux(language)
    }
    componentDidMount() {

        let { userInfo } = this.props;
        let menu = [];
        if (userInfo && !_.isEmpty(userInfo)) {
            let role = userInfo.user?.roleId
            if (role === USER_ROLE.ADMIN) {
                menu = [...adminMenu, ...providerMenu];
            }
            if (role === USER_ROLE.PROVIDER) {
                menu = providerMenu;
            }
        }
        this.setState({
            MenuApp: menu
        })
    }
    render() {
        const { processLogout, language, userInfo } = this.props;
        return (
            <div className="header-container">
                <div className="left-header">
                    {/* Home*/}
                    <div
                        className="btn-home"
                        onClick={() => this.props.history.push('/home')}
                        title="Home"
                    >
                        <i className="fas fa-home"></i>
                    </div>

                    {/* thanh navigator */}
                    <div className="header-tabs-container">
                        <Navigator menus={this.state.MenuApp} />
                    </div>
                </div>
                <div className="languages">
                    <span className="welcome">
                        <FormattedMessage
                            id="homeheader.welcome"
                            values={{ name: userInfo?.user?.firstName || '' }}
                        />!
                    </span>
                    <span className={language === LANGUAGES.VI ? "language-vi active" : "language-vi"}
                        onClick={() => this.handleChangeLanguage(LANGUAGES.VI)}
                    >VN
                    </span>
                    <span className={language === LANGUAGES.EN ? "language-en active" : "language-en"}
                        onClick={() => this.handleChangeLanguage(LANGUAGES.EN)}>
                        EN
                    </span>
                    {/* nút logout */}
                    <div className="btn btn-logout" onClick={processLogout} title="Log out">
                        <i className="fas fa-sign-out-alt"></i>
                    </div>
                </div>
            </div>
        );
    }

}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.user.isLoggedIn,
        language: state.app.language,
        userInfo: state.user.userInfo,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        processLogout: () => dispatch(actions.processLogout()),
        changeLanguageAppRedux: (language) => dispatch(actions.changeLanguageApp(language))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Header));
