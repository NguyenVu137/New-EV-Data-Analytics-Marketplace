import React, { Component } from 'react';
import { connect } from 'react-redux';
import Slider from "react-slick";


class FeaturedData extends Component {

    render() {
        return (
            <div className="section-share section-featured-data">
                <div className="section-container">
                    <div className="section-header">
                        <span className="title-section">Dữ liệu nổi bật tuần qua</span>
                        <button className="btn-section">Xem thêm</button>
                    </div>
                    <div className="section-body">
                        <Slider {...this.props.settings}>
                            <div className="section-customize">
                                <div className="bg-image section-featured-data" />
                                <div className="position text-center">
                                    <div>Tesla</div>
                                </div>
                            </div>
                            <div className="section-customize">
                                <div className="bg-image section-featured-data" />
                                <div className="position text-center">
                                    <div>BMW</div>
                                </div>
                            </div>
                            <div className="section-customize">
                                <div className="bg-image section-featured-data" />
                                <div className="position text-center">
                                    <div>Hyundai</div>
                                </div>
                            </div>
                            <div className="section-customize">
                                <div className="bg-image section-featured-data" />
                                <div className="position text-center">
                                    <div>Kia</div>
                                </div>
                            </div>
                            <div className="section-customize">
                                <div className="bg-image section-featured-data" />
                                <div className="position text-center">
                                    <div>Vinfast</div>
                                </div>
                            </div>
                            <div className="section-customize">
                                <div className="bg-image section-featured-data" />
                                <div className="position text-center">
                                    <div>Mazda</div>
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

export default connect(mapStateToProps, mapDispatchToProps)(FeaturedData);
