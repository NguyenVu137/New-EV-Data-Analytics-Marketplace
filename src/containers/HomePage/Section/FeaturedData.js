import React, { Component } from 'react';
import { connect } from 'react-redux';
import Slider from "react-slick";
import * as actions from '../../../store/actions';
import { withRouter } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { LANGUAGES } from '../../../utils';
class FeaturedData extends Component {
    constructor(props) {
        super(props);
        this.state = {
            arrDatas: []
        };
    }

    componentDidMount() {
        this.props.loadTopDatas();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.topDatas !== this.props.topDatas) {
            this.setState({
                arrDatas: this.props.topDatas
            });
        }
    }

    handleViewDetailData = (data) => {
        this.props.history.push(`/detail-data/${data.id}`);
    }

    render() {
        const { arrDatas } = this.state;
        const { language } = this.props;

        return (
            <div className="section-share section-featured-data">
                <div className="section-container">
                    <div className="section-header">
                        <span className="title-section">
                            <FormattedMessage id="homepage.featured-data" defaultMessage="Dữ liệu nổi bật" />
                        </span>
                        <button className="btn-section">
                            <FormattedMessage id="homepage.more-info" defaultMessage="Xem thêm" />
                        </button>
                    </div>

                    <div className="section-body">
                        <Slider {...this.props.settings}>
                            {arrDatas && arrDatas.length > 0 &&
                                arrDatas.map((item, index) => {
                                    const isImage = item.file_url && /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(item.file_url);
                                    const imageUrl = isImage ? item.file_url : null;

                                    const providerName = item.provider
                                        ? `${item.provider.firstName || ''} ${item.provider.lastName || ''}`.trim()
                                        : 'Unknown Provider';

                                    return (
                                        <div
                                            className="section-customize"
                                            key={index}
                                            onClick={() => this.handleViewDetailData(item)}
                                        >
                                            <div
                                                className="bg-image section-featured-data"
                                                style={imageUrl
                                                    ? { backgroundImage: `url(${imageUrl})` }
                                                    : {
                                                        backgroundColor: '#ddd',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#555',
                                                        fontSize: '14px'
                                                    }}
                                            >
                                                {!imageUrl && <span>No Image</span>}
                                            </div>

                                            <div className="position text-center">
                                                <div className="data-title">{item.title || 'Untitled'}</div>
                                                <div className="data-provider">{providerName}</div>
                                            </div>
                                        </div>
                                    );
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
        topDatas: state.admin.topDatas,
        language: state.app.language
    };
};

const mapDispatchToProps = dispatch => {
    return {
        loadTopDatas: () => dispatch(actions.fetchTopData())
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(FeaturedData));
