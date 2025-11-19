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
            selectedDataType: '',
            description: '',
            listDatas: [],
            listDataTypes: [],
            hasOldData: false
        }
    }

    componentDidMount() {
        this.props.fetchAllDatas();
        this.props.fetchDataCodes();
        // if logged-in user is provider, preselect them
        let { userInfo } = this.props;
        if (userInfo && userInfo.roleId === 'R2') {
            this.setState({
                selectedData: { label: `${userInfo.firstName} ${userInfo.lastName}`, value: userInfo.id }
            })
        }
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

    buildDataTypeSelect = (inputData) => {
        let result = [];
        let { language } = this.props;
        if (inputData && inputData.length > 0) {
            inputData.map((item, index) => {
                let object = {};
                object.label = language === LANGUAGES.VI ? item.valueVi : item.valueEn;
                object.value = item.keyMap;
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
        if (prevProps.dataTypes !== this.props.dataTypes) {
            let dataTypeSelect = this.buildDataTypeSelect(this.props.dataTypes)
            this.setState({
                listDataTypes: dataTypeSelect,
                selectedDataType: dataTypeSelect && dataTypeSelect.length > 0 ? dataTypeSelect[0] : ''
            })
        }

        // if user info becomes available (e.g., after login) and user is provider, set selectedData
        if (prevProps.userInfo !== this.props.userInfo) {
            let { userInfo } = this.props;
            if (userInfo && userInfo.roleId === 'R2') {
                this.setState({
                    selectedData: { label: `${userInfo.firstName} ${userInfo.lastName}`, value: userInfo.id }
                })
            }
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
        let providerId = this.state.selectedData && this.state.selectedData.value;
        // if logged in user is provider, use their id
        if (this.props.userInfo && this.props.userInfo.roleId === 'R2') {
            providerId = this.props.userInfo.id;
        }

        this.props.saveDetailData({
            contentHTML: this.state.contentHTML,
            contentMarkdown: this.state.contentMarkdown,
            description: this.state.description,
            dataId: providerId,
            dataType: this.state.selectedDataType && this.state.selectedDataType.value ? this.state.selectedDataType.value : '',
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
        let { userInfo } = this.props;
        return (
            <div className="manage-data-container">
                <div className="manage-data-title">
                    Tạo thêm dữ liệu xe
                </div>
                <div className="more-infor">
                    {/* If logged in user is provider, hide provider select and use their id */}
                    {userInfo && userInfo.roleId === 'R2' ? (
                        <div className="content-left form-group">
                            <label>Nhà cung cấp</label>
                            <div className="provider-static">{`${userInfo.firstName} ${userInfo.lastName}`}</div>
                        </div>
                    ) : (
                        <div className="content-left form-group">
                            <label>Chọn nhà cung cấp</label>
                            <Select
                                value={this.state.selectedData}
                                onChange={this.handleChange}
                                options={this.state.listDatas}
                            />
                        </div>
                    )}

                    <div className="content-mid form-group">
                        <label>Chọn kiểu DATA</label>
                        <Select
                            value={this.state.selectedDataType}
                            onChange={(selected) => this.setState({ selectedDataType: selected })}
                            options={this.state.listDataTypes}
                        />
                    </div>

                    <div className="content-right">
                        <label>Thông tin giới thiệu</label>
                        <textarea className="form-control" rows="4"
                            onChange={(event) => this.handleOnChangeDesc(event)}
                            value={this.state.description}
                        />
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
        allDatas: state.admin.allDatas,
        dataTypes: state.admin.dataTypes,
        userInfo: state.user.userInfo
    };
};

const mapDispatchToProps = dispatch => {
    return {
        fetchAllDatas: () => dispatch(actions.fetchAllDatas()),
        fetchDataCodes: () => dispatch(actions.fetchDataCodes()),
        saveDetailData: (data) => dispatch(actions.saveDetailData(data))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageData);
