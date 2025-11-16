import React, { Component } from 'react';
import { connect } from 'react-redux';
import HomePage from '../containers/HomePage/HomePage';

class Home extends Component {

    render() {
        console.log('🏠 Home.js render - location:', window.location.pathname);
        // Just render HomePage - role-based logic is handled in System/Provider components
        return <HomePage />;
    }

}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.user.isLoggedIn,
        userInfo: state.user.userInfo
    };
};

export default connect(mapStateToProps)(Home);
