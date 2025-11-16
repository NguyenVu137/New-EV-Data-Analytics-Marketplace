import React, { Component } from 'react';
import { connect } from "react-redux";
import { Route, Switch } from 'react-router-dom';
import { push } from 'connected-react-router';
import ManageUseRights from '../containers/System/Provider/ManageUseRights';
import Header from '../containers/Header/Header';

class Provider extends Component {
    componentDidMount() {
        const { isLoggedIn, userInfo } = this.props;
        
        // If not logged in, don't do anything (router will handle redirect)
        if (!isLoggedIn) {
            console.log('❌ Provider.js componentDidMount - Not logged in');
            return;
        }
        
        // If userInfo doesn't exist yet, wait for it to load
        if (!userInfo || !userInfo.user) {
            console.log('⏳ Provider.js componentDidMount - Waiting for userInfo');
            return;
        }
        
        // Check if user is NOT provider, redirect to /home
        const roleId = userInfo.user.roleId;
        if (roleId !== 'R2' && roleId !== 2) {
            console.log('❌ Provider.js componentDidMount - Not provider (role:', roleId, '), redirecting to /home');
            this.props.navigate('/home');
            return;
        }
        
        console.log('✅ Provider.js componentDidMount - Provider detected');
    }
    
    render() {
        const { isLoggedIn, userInfo } = this.props;
        
        // If not logged in, don't render anything (router will handle redirect)
        if (!isLoggedIn) {
            console.log('❌ Provider.js render - Not logged in');
            return null;
        }
        
        // If userInfo doesn't exist yet but isLoggedIn is true, wait for it to load
        // Don't redirect, just return loading state
        if (!userInfo || !userInfo.user) {
            console.log('⏳ Provider.js render - Waiting for userInfo...');
            return <div>Loading...</div>;
        }
        
        // If userInfo exists and user is not provider, don't render
        // (will be redirected in componentDidMount)
        const roleId = userInfo.user.roleId;
        if (roleId !== 'R2' && roleId !== 2) {
            console.log('❌ Provider.js render - Not provider (role:', roleId, '), already redirecting');
            return null;
        }
        
        console.log('✅ Provider.js render - Provider detected, rendering page');
        
        return (
            <React.Fragment>
                {this.props.isLoggedIn && <Header />}
                <div className="system-container">
                    <div className="system-list">
                        <Switch>
                            <Route path="/provider/manage-use-rights" component={ManageUseRights} />
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

export default connect(mapStateToProps, mapDispatchToProps)(Provider);