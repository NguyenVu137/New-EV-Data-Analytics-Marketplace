import React, { Component } from 'react';
import { connect } from "react-redux";
import { Redirect, Route, Switch } from 'react-router-dom';
import UserManage from '../containers/System/UserManage';
import UserRedux from '../containers/System/Admin/UserRedux.js';
import Header from '../containers/Header/Header';
import RoleRoute from './RoleRoutes.js';
import DataManage from '../containers/System/Provider/DataManage.js';
import DataApproval from '../containers/System/Admin/DataApproval.js';
import MarketAnalyticsDashboard from '../containers/System/Admin/MarketAnalyticsDashboard.js';
class System extends Component {
    render() {
        const { systemMenuPath, isLoggedIn } = this.props;
        return (
            <React.Fragment>
                {this.props.isLoggedIn && <Header />}
                <div className="system-container">
                    <div className="system-list">
                        <Switch>
                            <RoleRoute path="/system/user-manage" allowedRoles={['R1']} component={UserManage} />
                            <RoleRoute path="/system/user-redux" allowedRoles={['R1']} component={UserRedux} />
                            <RoleRoute path="/system/manage-data" allowedRoles={['R1', 'R2']} component={DataManage} />
                            <RoleRoute path="/system/manage-censor" allowedRoles={['R1']} component={DataApproval} />
                            <RoleRoute path="/system/analyticsdashboard" allowedRoles={['R1']} component={MarketAnalyticsDashboard} />

                            <Route component={() => <Redirect to="/home" />} />
                        </Switch>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => {
    return {
        systemMenuPath: state.app.systemMenuPath,
        isLoggedIn: state.user.isLoggedIn
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(System);
