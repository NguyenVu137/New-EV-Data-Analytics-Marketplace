import React, { Component } from 'react';
import { connect } from 'react-redux';
import './Specialty.scss';
import { FormattedMessage } from 'react-intl';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import specialtyImg from '../../../assets/data/Tesla_Model_3.jpg'

class Specialty extends Component {

    render() {
        let settings = {
            dots: false,
            infinite: true,
            speed: 500,
            slidesToShow: 4,
            slidesToScroll: 1,
        }
        return (
            <div className="section-specialty">
                <div className="specialty-container">
                    <div className="specialty-header">
                        <span className="title-section">Phổ biến</span>
                        <button className="btn-section">Xem thêm</button>
                    </div>
                    <div className="specialty-body">
                        <Slider {...settings}>
                            <div className="specialty-customize">
                                <div className="bg-image"/>
                                <div className="specialty-title">Tesla Model 3</div>
                            </div>
                            <div className="specialty-customize">
                                <div className="bg-image"/>
                                <div className="specialty-title">Tesla Model 3</div>
                            </div>
                            <div className="specialty-customize">
                                <div className="bg-image"/>
                                <div className="specialty-title">Tesla Model 3</div>
                            </div>
                            <div className="specialty-customize">
                                <div className="bg-image"/>
                                <div className="specialty-title">Tesla Model 3</div>
                            </div>
                            <div className="specialty-customize">
                                <div className="bg-image"/>
                                <div className="specialty-title">Tesla Model 3</div>
                            </div>
                            <div className="specialty-customize">
                                <div className="bg-image"/>
                                <div className="specialty-title">Tesla Model 3</div>
                            </div>
                        </Slider>
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

    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Specialty);
