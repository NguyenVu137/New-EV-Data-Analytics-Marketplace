import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import './About.scss';

class About extends Component {
    render() {
        return (
            <div className="about-page">
                <Navbar />

                <div className="about-container">
                    <div className="about-header">
                        <h1>Về chúng tôi</h1>
                        <p>Nền tảng phân tích và thương mại hóa dữ liệu xe điện hàng đầu Việt Nam</p>
                    </div>

                    <div className="about-content">
                        <section className="about-section">
                            <div className="section-icon">
                                <i className="fa-solid fa-bolt"></i>
                            </div>
                            <h2>Sứ mệnh</h2>
                            <p>
                                Chúng tôi cam kết xây dựng một hệ sinh thái dữ liệu xe điện toàn diện,
                                kết nối các nhà cung cấp dữ liệu với những người cần phân tích và nghiên cứu.
                                Thông qua nền tảng của mình, chúng tôi góp phần thúc đẩy sự phát triển bền vững
                                của ngành công nghiệp xe điện tại Việt Nam.
                            </p>
                        </section>

                        <section className="about-section">
                            <div className="section-icon">
                                <i className="fa-solid fa-eye"></i>
                            </div>
                            <h2>Tầm nhìn</h2>
                            <p>
                                Trở thành nền tảng dữ liệu xe điện số 1 tại Việt Nam, cung cấp các giải pháp
                                phân tích thông minh và báo cáo chuyên sâu cho các doanh nghiệp, nhà nghiên cứu
                                và cơ quan quản lý. Chúng tôi hướng tới việc chuẩn hóa và nâng cao chất lượng
                                dữ liệu trong ngành xe điện.
                            </p>
                        </section>

                        <section className="about-section">
                            <div className="section-icon">
                                <i className="fa-solid fa-bullseye"></i>
                            </div>
                            <h2>Giá trị cốt lõi</h2>
                            <div className="values-grid">
                                <div className="value-item">
                                    <i className="fa-solid fa-shield-halved"></i>
                                    <h3>Bảo mật</h3>
                                    <p>Đảm bảo an toàn tuyệt đối cho dữ liệu của khách hàng</p>
                                </div>
                                <div className="value-item">
                                    <i className="fa-solid fa-check-circle"></i>
                                    <h3>Chất lượng</h3>
                                    <p>Cam kết dữ liệu chính xác, đáng tin cậy</p>
                                </div>
                                <div className="value-item">
                                    <i className="fa-solid fa-users"></i>
                                    <h3>Hợp tác</h3>
                                    <p>Xây dựng cộng đồng chia sẻ và phát triển</p>
                                </div>
                                <div className="value-item">
                                    <i className="fa-solid fa-rocket"></i>
                                    <h3>Đổi mới</h3>
                                    <p>Không ngừng cải tiến công nghệ và dịch vụ</p>
                                </div>
                            </div>
                        </section>

                        <section className="about-section">
                            <div className="section-icon">
                                <i className="fa-solid fa-chart-line"></i>
                            </div>
                            <h2>Thành tựu</h2>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-number">1000+</div>
                                    <div className="stat-label">Dataset</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-number">500+</div>
                                    <div className="stat-label">Nhà cung cấp</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-number">5000+</div>
                                    <div className="stat-label">Người dùng</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-number">99.9%</div>
                                    <div className="stat-label">Uptime</div>
                                </div>
                            </div>
                        </section>

                        <section className="about-section cta-section">
                            <h2>Tham gia cùng chúng tôi</h2>
                            <p>
                                Bạn là nhà cung cấp dữ liệu? Bạn đang tìm kiếm dữ liệu chất lượng?
                                Hãy đăng ký ngay hôm nay để trở thành một phần của cộng đồng!
                            </p>
                            <div className="cta-buttons">
                                <button
                                    className="btn-primary"
                                    onClick={() => this.props.history.push('/register')}
                                >
                                    <i className="fa-solid fa-user-plus"></i> Đăng ký ngay
                                </button>
                                <button
                                    className="btn-secondary"
                                    onClick={() => this.props.history.push('/datasets')}
                                >
                                    <i className="fa-solid fa-database"></i> Khám phá dữ liệu
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.user.isLoggedIn
    };
};

export default withRouter(connect(mapStateToProps)(About));
