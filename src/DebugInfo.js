import React from 'react';
import { connect } from 'react-redux';

const DebugInfo = ({ isLoggedIn, userInfo }) => {
    return (
        <div style={{
            position: 'fixed',
            bottom: 10,
            right: 10,
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '12px',
            zIndex: 9999,
            maxWidth: '300px',
            maxHeight: '200px',
            overflowY: 'auto',
            fontFamily: 'monospace'
        }}>
            <div><strong>Debug Info:</strong></div>
            <div>isLoggedIn: {String(isLoggedIn)}</div>
            <div>roleId: {userInfo?.user?.roleId || 'undefined'}</div>
            <div>userEmail: {userInfo?.user?.email || 'undefined'}</div>
            <div>userInfo exists: {userInfo ? 'yes' : 'no'}</div>
            <div>location: {window.location.pathname}</div>
        </div>
    );
};

const mapStateToProps = state => ({
    isLoggedIn: state.user.isLoggedIn,
    userInfo: state.user.userInfo
});

export default connect(mapStateToProps)(DebugInfo);
