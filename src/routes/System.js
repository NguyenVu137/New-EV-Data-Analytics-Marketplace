import React, { Component } from 'react';
import { connect } from "react-redux";
import { Route, Switch } from 'react-router-dom';
import { push } from 'connected-react-router';
import UserManage from '../containers/System/UserManage';
import UserRedux from '../containers/System/Admin/UserRedux.js';
import Header from '../containers/Header/Header';
import ManageData from '../containers/System/Admin/ManageData.js';

class System extends Component {
    componentDidMount() {
        const { isLoggedIn, userInfo } = this.props;
        
        console.log('🔄 System.js componentDidMount called');
        console.log('   - isLoggedIn:', isLoggedIn);
        console.log('   - userInfo:', JSON.stringify(userInfo, null, 2));
        
        // If not logged in, don't do anything (router will handle redirect)
        if (!isLoggedIn) {
            console.log('❌ NOT LOGGED IN - exiting');
            return;
        }
        
        // If userInfo doesn't exist yet, wait for it to load
        if (!userInfo || !userInfo.user) {
            console.log('⏳ userInfo NOT READY YET - exiting');
            return;
        }
        
        // Check if user is NOT admin, redirect to /home
        const roleId = userInfo.user.roleId;
        console.log('🔐 Role check:');
        console.log('   - roleId value:', roleId);
        console.log('   - roleId type:', typeof roleId);
        console.log('   - roleId === "R1" ?', roleId === 'R1');
        console.log('   - roleId === 1 ?', roleId === 1);
        console.log('   - roleId !== "R1" && roleId !== 1 ?', roleId !== 'R1' && roleId !== 1);
        
        if (roleId !== 'R1' && roleId !== 1) {
            console.log('❌ NOT ADMIN - navigating to /home');
            this.props.navigate('/home');
            return;
        }
        
        console.log('✅ ADMIN DETECTED - rendering System page');
    }
    
    render() {
        const { systemMenuPath, isLoggedIn, userInfo } = this.props;
        
        console.log('🔍 System.js render:', { isLoggedIn, userInfo, roleId: userInfo?.user?.roleId });
        
        // If not logged in, don't render anything (router will handle redirect)
        if (!isLoggedIn) {
            console.log('❌ System.js render - Not logged in');
            return null;
        }
        
        // If userInfo doesn't exist yet but isLoggedIn is true, wait for it to load
        // Don't redirect, just return loading state
        if (!userInfo || !userInfo.user) {
            console.log('⏳ System.js render - Waiting for userInfo...');
            return <div>Loading...</div>;
        }
        
        // If userInfo exists and user is not admin, don't render
        // (will be redirected in componentDidMount)
        const roleId = userInfo.user.roleId;
        if (roleId !== 'R1' && roleId !== 1) {
            console.log('❌ System.js render - Not admin (role:', roleId, '), already redirecting');
            return null;
        }
        
        console.log('✅ System.js render - Admin detected, rendering page');
        
        return (
            <React.Fragment>
                {this.props.isLoggedIn && <Header />}
                <div className="system-container">
                    <div className="system-list">
                        <Switch>
                            <Route path="/system/user-manage" component={UserManage} />
                            <Route path="/system/user-redux" component={UserRedux} />
                            <Route path="/system/manage-data" component={ManageData} />
                            <Route component={() => { return (<div>404 - Page not found</div>) }} />
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
        isLoggedIn: state.user.isLoggedIn,
        userInfo: state.user.userInfo
    };
};

const mapDispatchToProps = dispatch => {
    return {
        navigate: (path) => dispatch(push(path))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(System);
