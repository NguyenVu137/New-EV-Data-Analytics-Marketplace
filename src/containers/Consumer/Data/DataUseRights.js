import React, { Component } from 'react';
import { connect } from "react-redux";
import './DataUseRights.scss';
import { LANGUAGES } from '../../../utils';
import { getDetailInforData } from '../../../services/userService';
import * as actions from '../../../store/actions';
import moment from 'moment';
import { getDataTypeById } from '../../../services/userService';

class DataUseRights extends Component {

    constructor(props) {
        super(props);
        this.state = {
            allDays: [],
            allAvailableData: [],
            dataType: [],
            selectedType: ''
        }
    }

    async componentDidMount() {
        let { language } = this.props;
        // load DATA codes from redux (similar to how genders/positions/roles are loaded)
        this.props.fetchDataCodes();
    }

    capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    async componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.language !== prevProps.language) {
            // this.setArrDays(this.props.language);
        }

        if (prevProps.dataTypes !== this.props.dataTypes) {
            let arrDataTypes = this.props.dataTypes;
            this.setState({
                dataType: arrDataTypes,
                selectedType: arrDataTypes && arrDataTypes.length > 0 ? arrDataTypes[0].keyMap : ''
            })

            // if parent provided a data id, load available data for the first dataType by default
            if (arrDataTypes && arrDataTypes.length > 0 && this.props.dataIdFromParent && this.props.dataIdFromParent !== -1) {
                let firstType = arrDataTypes[0].keyMap;
                let res = await getDataTypeById(this.props.dataIdFromParent, firstType);
                if (res && res.errCode === 0) {
                    this.setState({
                        allAvailableData: res.data ? res.data : []
                    })
                }
            }
        }
    }

    handleOnChangeSelect = async (event) => {
        let dataType = event.target.value;
        this.setState({ selectedType: dataType });
        if (this.props.dataIdFromParent && this.props.dataIdFromParent !== -1) {
            let dataId = this.props.dataIdFromParent;
            let res = await getDataTypeById(dataId, dataType);

            if (res && res.errCode === 0) {
                this.setState({
                    allAvailableData: res.data ? res.data : []
                })
            }
            console.log("check res schedule by date: ", res);
        }
    }


    render() {
        let { allDays, allAvailableData, dataType } = this.state;
        let { language } = this.props;
        console.log("check state: ", this.state);
        return (
            <div className='data-use-rights-container'>
                {/* <div className='data-use-rights-content'>
                    <select onChange={(event) => this.handleOnChangeSelect(event)}>
                        {allDays && allDays.length > 0 &&
                            allDays.map((item, index) => {
                                return (
                                    <option
                                        key={index}
                                        value={item.value}
                                    >
                                        {item.label}
                                    </option>
                                )
                            })
                        }
                    </select>
                </div> */}

                <div className='data-use-rights-content'>
                    <div className="header">
                        <div className="title">Chọn loại dữ liệu</div>
                        <div className="subtitle">Chọn gói dữ liệu phù hợp để xem quyền sử dụng</div>
                    </div>
                    <div className="select-wrap">
                        <select value={this.state.selectedType} onChange={(event) => this.handleOnChangeSelect(event)}>
                            <option value="" disabled hidden>{language === LANGUAGES.VI ? 'Chọn loại dữ liệu' : 'Select data type'}</option>
                            {dataType && dataType.length > 0 &&
                                dataType.map((item, index) => {
                                    let label = language === LANGUAGES.VI ? item.valueVi : item.valueEn;
                                    return (
                                        <option
                                            key={index}
                                            value={item.keyMap}
                                        >
                                            {label}
                                        </option>
                                    )
                                })
                            }
                        </select>
                    </div>
                </div>

                
                <div className="all-available-data">
                    <div className="text-use-rights">
                        <i className="fa-solid fa-user"><span>Loại gói</span></i>
                    </div>
                    <div className="data-content">
                        {allAvailableData && allAvailableData.length > 0 ?
                            allAvailableData.map((item, index) => {
                                let timeData = language === LANGUAGES.VI ? item.timeTypeData.valueVi : item.timeTypeData.valueEn;
                                return (
                                    <button key={index}>{timeData}</button>
                                )
                            }) : <div>Không có dữ liệu</div>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        language: state.app.language,
        dataTypes: state.admin.dataTypes,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        fetchDataCodes: () => dispatch(actions.fetchDataCodes()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(DataUseRights);
