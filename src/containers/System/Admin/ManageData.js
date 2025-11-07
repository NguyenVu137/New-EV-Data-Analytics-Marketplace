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

const options = [
    { value: 'chocolate', label: 'chocolate' },
    { value: 'matcha', label: 'matcha' },
    { value: 'caramel', label: 'caramel' },
];

const mdParser = new MarkdownIt(/* Markdown-it options */);

class ManageData extends Component {

    constructor(props) {
        super(props);
        this.state = {
            contentMarkdown: '',
            contentHTML: '',
            selectedData: '',
            description: ''
        }
    }

    componentDidMount() {
        
    }

    componentDidUpdate(prevProps, prevState, snapshot) {

    }

    handleEditorChange = ({ html, text }) => {
        this.setState({
            contentMarkdown: text,
            contentHTML: html,
        })
    }

    handleSaveContentMarkdown = () => {
        console.log('check state: ', this.state)
    }

    handleChange = selectedData => {
        this.setState({ selectedData });
        // console.log(`Option selected: `, selectedData)
    }

    handleOnChangeDesc = (event) => {
        this.setState({
            description: event.target.value
        })
    }

    render() {
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
                            options={options}
                        />
                    </div>
                    <div className="content-right">
                        <label>Thông tin giới thiệu</label>
                        <textarea className="form-control" rows="4"
                            onChange = { (event) => this.handleOnChangeDesc(event)}
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
                    />
                </div>
                <button
                    onClick={() => this.handleSaveContentMarkdown()}
                    className="save-content-data">
                    Lưu thông tin
                </button>
            </div>
        );
    }
}


const mapStateToProps = state => {
    return {
        listUsers: state.admin.users
    };
};

const mapDispatchToProps = dispatch => {
    return {
        fetchUserRedux: () => dispatch(actions.fetchAllUsersStart()),
        deleteUserRedux: (id) => dispatch(actions.deleteUser(id))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageData);
