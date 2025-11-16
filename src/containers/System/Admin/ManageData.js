import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import './TableManageUser.scss';
import * as actions from "../../../store/actions";
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import './ManageData.scss';
import Select from 'react-select';
import { CRUD_ACTIONS, LANGUAGES } from '../../../utils';
import { getDetailInforData } from '../../../services/userService';

const mdParser = new MarkdownIt(/* Markdown-it options */);

class ManageData extends Component {

    constructor(props) {
        super(props);
        this.state = {
            contentMarkdown: '',
            contentHTML: '',
            selectedData: '',
            description: '',
            listDatas: [],
            hasOldData: false
        }
    }

    componentDidMount() {
        this.props.fetchAllDatas();
    }

    buildDataInputSelect = (inputData) => {
        let result = [];
        let { language } = this.props;
        if (inputData && inputData.length > 0) {
            inputData.map((item, index) => {
                let object = {};
                let labelVi = `${item.lastName} ${item.firstName}`;
                let labelEn = `${item.firstName} ${item.lastName}`;
                object.label = language === LANGUAGES.VI ? labelVi : labelEn;
                object.value = item.id;
                result.push(object);
            })

        }

        return result;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.allDatas !== this.props.allDatas) {
            let dataSelect = this.buildDataInputSelect(this.props.allDatas)
            this.setState({
                listDatas: dataSelect
            })
        }
        if (prevProps.language !== this.props.language) {
            let dataSelect = this.buildDataInputSelect(this.props.allDatas)
            this.setState({
                listDatas: dataSelect
            })
        }
    }

    handleEditorChange = ({ html, text }) => {
        this.setState({
            contentMarkdown: text,
            contentHTML: html,
        })
    }

    handleSaveContentMarkdown = () => {
        let { hasOldData } = this.state
        this.props.saveDetailData({
            contentHTML: this.state.contentHTML,
            contentMarkdown: this.state.contentMarkdown,
            description: this.state.description,
            dataId: this.state.selectedData.value,
            action: hasOldData === true ? CRUD_ACTIONS.EDIT : CRUD_ACTIONS.CREATE
        })
    }

    handleChange = async selectedData => {
        this.setState({ selectedData });

        let res = await getDetailInforData(selectedData.value);
        if (res && res.errCode === 0 && res.data && res.data.Markdown) {
            let markdown = res.data.Markdown;
            this.setState({
                contentHTML: markdown.contentHTML,
                contentMarkdown: markdown.contentMarkdown,
                description: markdown.description,
                hasOldData: true
            })
        } else {
            this.setState({
                contentHTML: '',
                contentMarkdown: '',
                description: '',
                hasOldData: false
            })
        }
    }

    handleOnChangeDesc = (event) => {
        this.setState({
            description: event.target.value
        })
    }

    render() {
        let { hasOldData } = this.state;
        return (
            <div className="manage-data-container">
                <div className="manage-data-title">
                    Tạo thêm dữ liệu xe
                </div>
                <div className="more-infor">
                    <div className="content-left form-group">
                        <label>Chọn kiểu dữ liệu</label>
                        <Select
                            value={this.state.selectedData}
                            onChange={this.handleChange}
                            options={this.state.listDatas}
                        />
                    </div>
                    <div className="content-right">
                        <label>Thông tin giới thiệu</label>
                        <textarea className="form-control" rows="4"
                            onChange={(event) => this.handleOnChangeDesc(event)}
                            value={this.state.description}
                        >
                            sdadsad
                        </textarea>
                    </div>
                </div>
                <div className="manage-data-editor">
                    <MdEditor
                        style={{ height: '500px' }}
                        renderHTML={text => mdParser.render(text)}
                        onChange={this.handleEditorChange}
                        value={this.state.contentMarkdown}
                    />
                </div>
                <button
                    onClick={() => this.handleSaveContentMarkdown()}
                    className={hasOldData === true ? "save-content-data" : "create-content-data"}>
                        {hasOldData === true ? 
                            <span>Lưu thông tin</span> : <span>Tạo thông tin</span>
                        }
                </button>
            </div>
        );
    }
}


const mapStateToProps = state => {
    return {
        language: state.app.language,
        allDatas: state.admin.allDatas
    };
};

const mapDispatchToProps = dispatch => {
    return {
        fetchAllDatas: () => dispatch(actions.fetchAllDatas()),
        saveDetailData: (data) => dispatch(actions.saveDetailData(data))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageData);
