import React, { Component } from 'react';
import { connect } from 'react-redux';
import Slider from "react-slick";


class CarBrands extends Component {

    render() {
        return (
            <div className="section-share section-car-brands">
                <div className="section-container">
                    <div className="section-header">
                        <span className="title-section">Hãng xe nổi bật</span>
                        <button className="btn-section">Xem thêm</button>
                    </div>
                    <div className="section-body">
                        <Slider {...this.props.settings}>
                            <div className="section-customize">
                                <div className="customize-border">
                                    <div className="outer-bg">
                                        <div className="bg-image section-car-brands" />
                                    </div>
                                    <div className="position text-center">
                                        <div>Tesla</div>
                                    </div>
                                </div>
                            </div>
                            <div className="section-customize">
                                <div className="customize-border">
                                    <div className="outer-bg">
                                        <div className="bg-image section-car-brands" />
                                    </div>
                                    <div className="position text-center">
                                        <div>BMW</div>
                                    </div>
                                </div>
                            </div>
                            <div className="section-customize">
                                <div className="customize-border">
                                    <div className="outer-bg">
                                        <div className="bg-image section-car-brands" />
                                    </div>
                                    <div className="position text-center">
                                        <div>Hyundai</div>
                                    </div>
                                </div>
                            </div>
                            <div className="section-customize">
                                <div className="customize-border">
                                    <div className="outer-bg">
                                        <div className="bg-image section-car-brands" />
                                    </div>
                                    <div className="position text-center">
                                        <div>Kia</div>
                                    </div>
                                </div>
                            </div>
                            <div className="section-customize">
                                <div className="customize-border">
                                    <div className="outer-bg">
                                        <div className="bg-image section-car-brands" />
                                    </div>
                                    <div className="position text-center">
                                        <div>Vinfast</div>
                                    </div>
                                </div>
                            </div>
                            <div className="section-customize">
                                <div className="customize-border">
                                    <div className="outer-bg">
                                        <div className="bg-image section-car-brands" />
                                    </div>
                                    <div className="position text-center">
                                        <div>Mazda</div>
                                    </div>
                                </div>
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
        isLoggedIn: state.user.isLoggedIn
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(CarBrands);
