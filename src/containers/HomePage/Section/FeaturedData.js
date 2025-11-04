import React, { Component } from 'react';
import { connect } from 'react-redux';
import Slider from "react-slick";
import * as actions from '../../../store/actions';
import { LANGUAGES } from '../../../utils';
import { FormattedDate, FormattedMessage } from 'react-intl';

class FeaturedData extends Component {
    constructor(props) {
        super(props)
        this.state = {
            arrDatas: []
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.topDatas !== this.props.topDatas) {
            this.setState({
                arrDatas: this.props.topDatas
            })
        }
    }

    componentDidMount() {
        this.props.loadTopDatas();
    }

    render() {
        let arrDatas = this.state.arrDatas;
        let { language } = this.props;
        // arrDatas = arrDatas.concat(arrDatas).concat(arrDatas)
        return (
            <div className="section-share section-featured-data">
                <div className="section-container">
                    <div className="section-header">
                        <span className="title-section">
                            <FormattedMessage id="homepage.featured-data" />
                        </span>
                        <button className="btn-section"><FormattedMessage id="homepage.more-info" /></button>
                    </div>
                    <div className="section-body">
                        <Slider {...this.props.settings}>
                            {arrDatas && arrDatas.length > 0
                                && arrDatas.map((item, index) => {
                                    let imageBase64 = '';
                                    if (item.image) {
                                        imageBase64 = new Buffer(item.image, 'base64').toString('binary');
                                    }
                                    let nameVi = `${item.positionData.valueVi}, ${item.lastName} ${item.firstName}`;
                                    let nameEn = `${item.positionData.valueEn}, ${item.firstName} ${item.lastName}`;
                                    return (
                                        <div className="section-customize" key={index}>
                                            <div className="bg-image section-featured-data"
                                                style={{ backgroundImage: `url(${imageBase64})` }}
                                            />
                                            <div className="position text-center">
                                                <div>{language === LANGUAGES.VI ? nameVi : nameEn}</div>
                                            </div>
                                        </div>
                                    )
                                })
                            }

                        </Slider>
                    </div>

                </div>
            </div>
        );
    }

}

const mapStateToProps = state => {
    return {
        language: state.app.language,
        isLoggedIn: state.user.isLoggedIn,
        topDatas: state.admin.topDatas
    };
};

const mapDispatchToProps = dispatch => {
    return {
        loadTopDatas: () => dispatch(actions.fetchTopData())
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(FeaturedData);
