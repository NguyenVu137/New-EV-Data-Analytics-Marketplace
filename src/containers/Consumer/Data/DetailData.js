import React, { Component } from 'react';
import { connect } from "react-redux";
import HomeHeader from '../../HomePage/HomeHeader';
import './DetailData.scss';
import { LANGUAGES } from '../../../utils';
import { getDetailInforData } from '../../../services/userService';

class DetailData extends Component {

    constructor(props) {
        super(props);
        this.state = {
            detailData: {}
        }
    }

    async componentDidMount() {
        if (this.props.match && this.props.match.params && this.props.match.params.id) {
            let id = this.props.match.params.id;
            let res = await getDetailInforData(id);
            if (res && res.errCode === 0) {
                this.setState({
                    detailData: res.data
                })
            }
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {

    }

    render() {
        console.log("check state: ", this.state);
        let { language } = this.props;
        let { detailData } = this.state;
        let nameVi = '', nameEn = '';
        if (detailData && detailData.positionData) {
            nameVi = `${detailData.positionData.valueVi}, ${detailData.lastName} ${detailData.firstName}`;
            nameEn = `${detailData.positionData.valueEn}, ${detailData.firstName} ${detailData.lastName}`;
        }

        return (
            <>
                <HomeHeader isShowBanner={false} />
                <div className="data-detail-container">
                    <div className="intro-data">
                        <div className="content-left"
                            style={{ backgroundImage: `url(${detailData && detailData.image ? detailData.image : ''})` }}>

                        </div>
                        <div className="content-right">
                            <div className="up">
                                {language === LANGUAGES.VI ? nameVi : nameEn}
                            </div>
                            <div className="down">
                                {detailData && detailData.Markdown && detailData.Markdown.description &&
                                    <span>
                                        {detailData.Markdown.description}
                                    </span>
                                }
                            </div>
                        </div>
                    </div>
                    <div className="data-price">

                    </div>
                    <div className="detail-infor-data">
                        {detailData && detailData.Markdown && detailData.Markdown.contentHTML &&
                            <div dangerouslySetInnerHTML={{ __html: detailData.Markdown.contentHTML }}>
                                
                            </div>
                        }
                    </div>
                </div>
            </>
        );
    }
}

const mapStateToProps = state => {
    return {
        language: state.app.language,
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailData);
