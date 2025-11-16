import React, { Component } from 'react';
import { connect } from "react-redux";
import "./ManageUseRights.scss";
import { FormattedMessage } from 'react-intl';
import Select from "react-select";
import * as actions from '../../../store/actions';
import { CRUD_ACTIONS, LANGUAGES, dateFormat } from '../../../utils';
import DatePicker from '../../../components/Input/DatePicker';
import moment from 'moment';
import { toast } from "react-toastify";
import _, { range } from 'lodash';

class UseRights extends Component {
    constructor(props) {
        super(props);

        this.state = {
            listOptions: [],
            selectedOption: {},
            currentDate: '',
            rangeTime: []
        }
    }

    componentDidMount() {
        this.props.fetchAllDatas();
        this.props.fetchAllScheduleTime();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.allDatas !== this.props.allDatas) {
            let dataSelect = this.buildDataInputSelect(this.props.allDatas);
            this.setState({
                listOptions: dataSelect
            })
        }
        if (prevProps.allScheduleTime !== this.props.allScheduleTime) {
            let data = this.props.allScheduleTime;
            if (data && data.length > 0) {
                data = data.map(item => ({ ...item, isSelected: false }))
            }
            this.setState({
                rangeTime: data
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

    handleChangeSelect = async (selectedOption) => {
        this.setState({ selectedOption: selectedOption })
    }

    handleOnChangeDatePicker = (date) => {
        this.setState({
            currentDate: date[0]
        })
    }

    handleClickBtnTime = (time) => {
        let { rangeTime } = this.state;
        if (rangeTime && rangeTime.length > 0) {
            rangeTime = rangeTime.map(item => {
                if (item.id === time.id) item.isSelected = !item.isSelected;
                return item;
            })
            this.setState({
                rangeTime: rangeTime
            })
        }
    }

    handleSaveSchedule = () => {
        let { rangeTime, selectedOption, currentDate } = this.state;
        let result = [];
        if (!currentDate) {
            toast.error("Invalid date!");
            return;
        }
        if (selectedOption && _.isEmpty(selectedOption)) {
            toast.error("Invalid selected user!");
            return;
        }

        let formatedDate = moment(currentDate).format(dateFormat.SEND_TO_SERVER);

        if (rangeTime && rangeTime.length > 0) {
            let selectedTime = rangeTime.filter(item => item.isSelected === true);
            if (selectedTime && selectedTime.length > 0) {
                selectedTime.map((schedule, index) => {
                    let object = {};
                    object.providerId = selectedOption.value;
                    object.date = schedule.keyMap;
                    result.push(object);
                })
            } else {
                toast.error("Invalid selected time!")
                return;
            }
        }
    }

    render() {
        let { rangeTime } = this.state;
        console.log('check state: ', this.state)
        let { language } = this.props;
        return (
            <div className='manage-use-rights-container'>
                <div className="m-u-s-title">
                    <FormattedMessage id="manage-use-rights.title" />
                </div>
                <div className="container">
                    <div className="row">
                        <div className="col-6 form-group">
                            <label><FormattedMessage id="manage-use-rights.choose-right" /></label>
                            <Select
                                value={this.state.selectedOption}
                                onChange={this.handleChangeSelect}
                                options={this.state.listOptions}
                            />
                        </div>
                        <div className="col-6 form-group">
                            <label><FormattedMessage id="manage-use-rights.choose-date" /></label>
                            <DatePicker
                                onChange={this.handleOnChangeDatePicker}
                                className="form-control"
                                value={this.state.currentDate}
                                minDate={new Date()}
                            />
                        </div>
                        <div className="col-12 pick-time-container">
                            {rangeTime && rangeTime.length > 0 &&
                                rangeTime.map((item, index) => {
                                    return (
                                        <button
                                            className={item.isSelected === true ? "btn btn-schedule active" : "btn btn-schedule"}
                                            key={index}
                                            onClick={() => this.handleClickBtnTime(item)}
                                        >
                                            {language === LANGUAGES.VI ? item.valueVi : item.valueEn}
                                        </button>
                                    )
                                })
                            }
                        </div>
                        <div className="col-12">
                            <button
                                className="btn btn-info btn-save-schedule"
                                onClick={() => this.handleSaveSchedule()}
                            >
                                <FormattedMessage id="manage-use-rights.save" />
                            </button>
                        </div>
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
        allDatas: state.admin.allDatas,
        allScheduleTime: state.admin.allScheduleTime,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        fetchAllDatas: () => dispatch(actions.fetchAllDatas()),
        fetchAllScheduleTime: () => dispatch(actions.fetchAllScheduleTime())
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(UseRights);
