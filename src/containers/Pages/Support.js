import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import './Support.scss';

class Support extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            email: '',
            subject: '',
            message: '',
            submitting: false,
            submitted: false
        };
    }

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.setState({ submitting: true });

        // Simulate API call
        setTimeout(() => {
            this.setState({
                submitting: false,
                submitted: true,
                name: '',
                email: '',
                subject: '',
                message: ''
            });

            setTimeout(() => {
                this.setState({ submitted: false });
            }, 5000);
        }, 1000);
    }

    render() {
        const { name, email, subject, message, submitting, submitted } = this.state;

        return (
            <div className="support-page">
                <Navbar />

                <div className="support-container">
                    <div className="support-header">
                        <h1>Hỗ trợ khách hàng</h1>
                        <p>Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7</p>
                    </div>

                    <div className="support-content">
                        <div className="support-info">
                            <div className="info-card">
                                <div className="card-icon">
                                    <i className="fa-solid fa-phone"></i>
                                </div>
                                <h3>Hotline</h3>
                                <p>1900-xxxx</p>
                                <p className="subtitle">Thứ 2 - Chủ nhật: 8:00 - 22:00</p>
                            </div>

                            <div className="info-card">
                                <div className="card-icon">
                                    <i className="fa-solid fa-envelope"></i>
                                </div>
                                <h3>Email</h3>
                                <p>support@evdata.vn</p>
                                <p className="subtitle">Phản hồi trong vòng 24h</p>
                            </div>

                            <div className="info-card">
                                <div className="card-icon">
                                    <i className="fa-solid fa-location-dot"></i>
                                </div>
                                <h3>Địa chỉ</h3>
                                <p>123 Đường ABC</p>
                                <p className="subtitle">Quận 1, TP. Hồ Chí Minh</p>
                            </div>

                        </div>

                        <div className="support-form-wrapper">
                            <div className="form-header">
                                <h2>Gửi yêu cầu hỗ trợ</h2>
                                <p>Điền thông tin bên dưới và chúng tôi sẽ liên hệ với bạn sớm nhất</p>
                            </div>

                            {submitted && (
                                <div className="success-message">
                                    <i className="fa-solid fa-circle-check"></i>
                                    <p>Cảm ơn bạn! Chúng tôi đã nhận được yêu cầu và sẽ phản hồi sớm.</p>
                                </div>
                            )}

                            <form className="support-form" onSubmit={this.handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Họ tên *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={name}
                                            onChange={this.handleChange}
                                            placeholder="Nhập họ tên của bạn"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={email}
                                            onChange={this.handleChange}
                                            placeholder="example@email.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Chủ đề *</label>
                                    <select
                                        name="subject"
                                        value={subject}
                                        onChange={this.handleChange}
                                        required
                                    >
                                        <option value="">Chọn chủ đề</option>
                                        <option value="technical">Vấn đề kỹ thuật</option>
                                        <option value="payment">Thanh toán</option>
                                        <option value="data">Dữ liệu</option>
                                        <option value="account">Tài khoản</option>
                                        <option value="other">Khác</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Nội dung *</label>
                                    <textarea
                                        name="message"
                                        value={message}
                                        onChange={this.handleChange}
                                        placeholder="Mô tả chi tiết vấn đề của bạn..."
                                        rows="6"
                                        required
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="btn-submit"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <i className="fa-solid fa-spinner fa-spin"></i>
                                            Đang gửi...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-paper-plane"></i>
                                            Gửi yêu cầu
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="faq-section">
                        <h2>Câu hỏi thường gặp</h2>
                        <div className="faq-grid">
                            <div className="faq-item">
                                <h3><i className="fa-solid fa-question-circle"></i> Làm sao để đăng ký tài khoản?</h3>
                                <p>Nhấn vào nút "Đăng ký" ở góc trên bên phải, điền thông tin và xác nhận email.</p>
                            </div>
                            <div className="faq-item">
                                <h3><i className="fa-solid fa-question-circle"></i> Tôi có thể tải dữ liệu miễn phí không?</h3>
                                <p>Có một số dataset miễn phí. Bạn có thể lọc theo giá để tìm dữ liệu phù hợp.</p>
                            </div>
                            <div className="faq-item">
                                <h3><i className="fa-solid fa-question-circle"></i> Làm thế nào để trở thành nhà cung cấp?</h3>
                                <p>Đăng ký tài khoản với vai trò Provider và upload dữ liệu của bạn sau khi được phê duyệt.</p>
                            </div>
                            <div className="faq-item">
                                <h3><i className="fa-solid fa-question-circle"></i> Phương thức thanh toán nào được hỗ trợ?</h3>
                                <p>Chúng tôi hỗ trợ thanh toán qua thẻ tín dụng, chuyển khoản ngân hàng và ví điện tử.</p>
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
        isLoggedIn: state.user.isLoggedIn
    };
};

export default withRouter(connect(mapStateToProps)(Support));
