import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { ConnectedRouter as Router } from 'connected-react-router';
import { history } from '../redux'
import { ToastContainer } from 'react-toastify';
import { userIsAuthenticated, userIsNotAuthenticated } from '../hoc/authentication';
import { path } from '../utils'
import Login from './Auth/Login';
import Logout from './Auth/Logout';
import System from '../routes/System';
import Provider from '../routes/Provider';
import { CustomToastCloseButton } from '../components/CustomToast';
import HomePage from './HomePage/HomePage.js'
import CustomScrollbars from '../components/CustomScrollbars.js';
import DatasetDetailPage from './DatasetDetailPage/DatasetDetailPage';
import SearchPage from '../components/search/SearchPage';
import PaymentPage from '../components/Payment/PaymentPage';
import PaymentConfirmation from './Payment/PaymentConfirmation';
import MyOrders from './Payment/MyOrders';
import MySubscriptions from './Payment/MySubscriptions';
import Analytics from './System/Analytics/Dashboard.js';
import PurchaseHistory from './PurchaseHistory/PurchaseHistory';
import { triggerAnalyticsRecalculation } from '../utils/analyticsAutoRefresh';

// Admin-only route wrapper
const AdminRoute = ({ component: Component, userInfo, isLoggedIn, ...rest }) => (
    <Route
        {...rest}
        render={(props) => {
            console.log('🔍 AdminRoute render:', { path: props.location.pathname, isLoggedIn });
            
            // If not logged in, don't render (will be handled by router)
            if (!isLoggedIn) {
                console.log('❌ AdminRoute - Not logged in, returning null');
                return null;
            }
            
            // If logged in, render System component regardless
            // System component will check role and redirect if needed
            // Or show loading if userInfo not ready
            console.log('✅ AdminRoute - Rendering System component');
            return <Component {...props} />;
        }}
    />
);

// Provider-only route wrapper
const ProviderRoute = ({ component: Component, userInfo, isLoggedIn, ...rest }) => (
    <Route
        {...rest}
        render={(props) => {
            console.log('🔍 ProviderRoute render:', { path: props.location.pathname, isLoggedIn });
            
            // If not logged in, don't render (will be handled by router)
            if (!isLoggedIn) {
                console.log('❌ ProviderRoute - Not logged in, returning null');
                return null;
            }
            
            // If logged in, render Provider component regardless
            // Provider component will check role and redirect if needed
            // Or show loading if userInfo not ready
            console.log('✅ ProviderRoute - Rendering Provider component');
            return <Component {...props} />;
        }}
    />
);

class App extends Component {

    handlePersistorState = () => {
        const { persistor } = this.props;
        let { bootstrapped } = persistor.getState();
        if (bootstrapped) {
            if (this.props.onBeforeLift) {
                Promise.resolve(this.props.onBeforeLift())
                    .then(() => this.setState({ bootstrapped: true }))
                    .catch(() => this.setState({ bootstrapped: true }));
            } else {
                this.setState({ bootstrapped: true });
            }
        }
    };

    componentDidMount() {
        this.handlePersistorState();
        // Trigger analytics recalculation on page load
        triggerAnalyticsRecalculation();
    }

    render() {
        const { userInfo, isLoggedIn } = this.props;
        
        console.log('🔍 App.js render:', { isLoggedIn, userInfo, roleId: userInfo?.user?.roleId });
        
        return (
            <Fragment>
                <Router history={history}>
                    <div className="main-container">
                        <div className="content-container">
                            <CustomScrollbars style={{ height: '100vh', width: '100%' }}>
                                <Switch>
                                    <Route path={path.LOGIN} component={Login} />
                                    <Route path={path.LOG_OUT} component={Logout} />
                                    <AdminRoute path={path.SYSTEM} component={System} userInfo={userInfo} isLoggedIn={isLoggedIn} />
                                    <ProviderRoute path={path.PROVIDER} component={Provider} userInfo={userInfo} isLoggedIn={isLoggedIn} />
                                    <Route path={path.ANALYTICS} component={Analytics} />
                                    <Route path={path.PURCHASE_HISTORY} component={userIsAuthenticated(PurchaseHistory)} />
                                    <Route path={path.HOME} component={HomePage} />
                                    <Route path={path.PAYMENT} component={PaymentPage} />
                                    <Route path={path.PAYMENT_CONFIRMATION} component={PaymentConfirmation} />
                                    <Route path={path.MY_ORDERS} component={userIsAuthenticated(MyOrders)} />
                                    <Route path={path.MY_SUBSCRIPTIONS} component={userIsAuthenticated(MySubscriptions)} />
                                    <Route path={path.DATASET_DETAIL} component={DatasetDetailPage} />
                                    <Route path={path.SEARCH} component={SearchPage} />
                                    <Route path={path.DATASETS} component={SearchPage} />
                                </Switch>
                            </CustomScrollbars>
                        </div>

                        {/* <ToastContainer
                            className="toast-container" toastClassName="toast-item" bodyClassName="toast-item-body"
                            autoClose={false} hideProgressBar={true} pauseOnHover={false}
                            pauseOnFocusLoss={true} closeOnClick={false} draggable={false}
                            closeButton={<CustomToastCloseButton />}
                        /> */}

                        <ToastContainer
                            position="bottom-right"
                            autoClose={5000}
                            hideProgressBar={false}
                            newestOnTop={false}
                            closeOnClick
                            rtl={false}
                            pauseOnFocusLoss
                            draggable
                            pauseOnHover
                            // transition={Bounce}
                        />
                    </div>
                </Router>
            </Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        started: state.app.started,
        isLoggedIn: state.user.isLoggedIn,
        userInfo: state.user.userInfo
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);