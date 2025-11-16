import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from "../../store/actions";
import { persistor } from '../../redux';

class Logout extends Component {
    componentDidMount() {
        // Perform logout
        this.props.processLogout();
        
        // Purge persistor to clear all persisted state (including Redux-persist cache)
        persistor.purge();
        
        // Clear localStorage (backup in case persistor fails)
        localStorage.removeItem('userId');
        localStorage.removeItem('persist:user');
        localStorage.removeItem('persist:root');
        localStorage.removeItem('persist:app');
        
        // Also clear sessionStorage
        sessionStorage.clear();
        
        // Redirect to home
        setTimeout(() => {
            window.location.href = '/';
        }, 500);
    }

    render() {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <p>Đang đăng xuất...</p>
            </div>
        );
    }
}

const mapDispatchToProps = dispatch => {
    return {
        processLogout: () => dispatch(actions.processLogout())
    };
};

export default connect(null, mapDispatchToProps)(Logout);
