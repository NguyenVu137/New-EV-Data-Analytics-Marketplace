import React from 'react';
import { withRouter } from 'react-router-dom';
import './Navbar.scss';

const Navbar = ({ history }) => {
    const handleHomeClick = () => {
        history.push('/home');
    };

    const handleAnalyticsClick = () => {
        history.push('/analytics');
    };

    const handleProviderClick = () => {
        // Add provider navigation
    };

    const handleAboutClick = () => {
        // Add about navigation
    };

    const handleSupportClick = () => {
        // Add support navigation
    };

    return (
        <div className="home-header-container">
            <div className="home-header-content">
                <div className="left-content">
                    <i className="fa-solid fa-bars"></i>
                    <div className="header-logo"></div>
                </div>
                <div className="center-content">
                    <div className="child-content" onClick={handleHomeClick}>
                        <div><b>Trang chủ</b></div>
                        <div></div>
                    </div>
                    <div className="child-content" onClick={handleAnalyticsClick}>
                        <div><b>Phân tích dữ liệu</b></div>
                        <div></div>
                    </div>
                    <div className="child-content" onClick={handleProviderClick}>
                        <div><b>Nhà cung cấp</b></div>
                        <div></div>
                    </div>
                    <div className="child-content" onClick={handleAboutClick}>
                        <div><b>Giới thiệu</b></div>
                        <div></div>
                    </div>
                </div>
                <div className="right-content">
                    <div className="support" onClick={handleSupportClick}>
                        <i className="fa-solid fa-circle-question"></i>Hỗ trợ
                    </div>
                    <div className="language-vi active"><span>VN</span></div>
                    <div className="language-en"><span>EN</span></div>
                </div>
            </div>
        </div>
    );
};

export default withRouter(Navbar);
