import React, { Component } from 'react';
import { connect } from 'react-redux';
import './HomeHeader.scss';
import { FormattedMessage } from 'react-intl';
import { LANGUAGES } from '../../utils';
import { changeLanguageApp } from '../../store/actions/appActions';
import { withRouter } from 'react-router-dom';

class HomeHeader extends Component {

    changeLanguage = (language) => {
        this.props.changeLanguageAppRedux(language)
        //fire redux event : actions
    }

    handleFilterClick = (filterType, filterValue) => {
        // Emit event or call parent to filter data
        if (this.props.onFilterChange) {
            this.props.onFilterChange(filterType, filterValue);
        }
    }

    handleAnalyticsClick = () => {
        this.props.history.push('/analytics');
    }
    
    render() {
        let language = this.props.language;
        return (
            <React.Fragment>
                <div className="home-header-container">
                    <div className="home-header-content">
                        <div className="left-content">
                            <i className="fa-solid fa-bars"></i>
                            <img src=""/>
                            <div className="header-logo"></div>
                        </div>
                        <div className="center-content">
                            <div className="child-content">
                                <div><b><FormattedMessage id="homeheader.homepage"/></b></div>
                                <div></div>
                            </div>
                            <div className="child-content" onClick={this.handleAnalyticsClick}>
                                <div><b><FormattedMessage id="homeheader.datalist"/></b></div>
                                <div></div>
                            </div>
                            <div className="child-content">
                                <div><b><FormattedMessage id="homeheader.provider"/></b></div>
                                <div></div>
                            </div>
                            <div className="child-content">
                                <div><b><FormattedMessage id="homeheader.about"/></b></div>
                                <div></div>
                            </div>
                        </div>
                        <div className="right-content">
                            <div className="support"><i className="fa-solid fa-circle-question"></i><FormattedMessage id="homeheader.support"/></div>
                            <div className={language === LANGUAGES.VI ? 'language-vi active' : 'language-vi'}><span onClick={() => this.changeLanguage(LANGUAGES.VI)}>VN</span></div>
                            <div className={language === LANGUAGES.EN ? 'language-en active' : 'language-en'}><span onClick={() => this.changeLanguage(LANGUAGES.EN)}>EN</span></div>
                        </div>
                    </div>
                </div>
                <div className="home-header-banner" style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
                    <div className="content-up" style={{ height: '220px', paddingTop: '15px', boxSizing: 'border-box', backgroundImage: 'linear-gradient(rgba(126, 126, 126, 0.25), rgba(255, 255, 255, 0.1))' }}>
                        <div className="title1"><FormattedMessage id="banner.title1"/></div>
                        <div className="title2"><FormattedMessage id="banner.title2"/></div>
                        <div className="search">
                            <i className="fa-solid fa-magnifying-glass"></i>
                            <input type="text" placeholder='Tìm kiếm dữ liệu'/>
                        </div>
                    </div>
                    <div className="content-down" style={{ height: '130px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 1))', paddingBottom: '10px', boxSizing: 'border-box' }}>   
                        <div className="options">
                            <div className="option-child" onClick={() => this.handleFilterClick('data_type', 'Hành vi lái xe')}>
                                <div className="icon-child"><i className="fa-solid fa-car"></i></div>
                                <div className="text-child"><FormattedMessage id="banner.child1"/></div>
                            </div>
                            <div className="option-child" onClick={() => this.handleFilterClick('data_type', 'Hiệu suất pin')}>
                                <div className="icon-child"><i className="fa-solid fa-battery-three-quarters"></i></div>
                                <div className="text-child"><FormattedMessage id="banner.child2"/></div>
                            </div>
                            <div className="option-child" onClick={() => this.handleFilterClick('data_type', 'Dữ liệu môi trường')}>
                                <div className="icon-child"><i className="fa-solid fa-earth-americas"></i></div>
                                <div className="text-child"><FormattedMessage id="banner.child3"/></div>
                            </div>
                            <div className="option-child" onClick={() => this.handleFilterClick('data_type', 'Giao dịch V2G')}>
                                <div className="icon-child"><i className="fa-solid fa-bolt"></i></div>
                                <div className="text-child"><FormattedMessage id="banner.child4"/></div>
                            </div>
                            <div className="option-child" onClick={() => this.handleFilterClick('data_type', 'Sử dụng trạm sạc')}>
                                <div className="icon-child"><i className="fa-solid fa-plug"></i></div>
                                <div className="text-child"><FormattedMessage id="banner.child5"/></div>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(HomeHeader));
