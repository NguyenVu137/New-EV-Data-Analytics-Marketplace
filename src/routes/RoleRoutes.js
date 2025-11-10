import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

/**
 * props:
 * - component: component muốn render
 * - allowedRoles: array ['R1', 'R2'] (R1 = admin, R2 = consumer)
 * - userInfo: từ redux
 */
const RoleRoute = ({ component: Component, allowedRoles, userInfo, ...rest }) => {
    return (
        <Route
            {...rest}
            render={props => {
                console.log("RoleRoute - userInfo:", userInfo);
                console.log("RoleRoute - userInfo.roleId:", userInfo?.roleId);
                console.log("RoleRoute - allowedRoles:", allowedRoles);
                if (!userInfo) {
                    // chưa login => redirect về login
                    return <Redirect to="/login" />;
                }

                const roleId = userInfo?.user?.roleId; // Lấy đúng roleId

                if (allowedRoles.includes(roleId)) {
                    // role hợp lệ => render component
                    return <Component {...props} />;
                } else {
                    // role không hợp lệ => redirect về home
                    return <Redirect to="/home" />;
                }
            }}
        />
    );
};

const mapStateToProps = state => ({
    userInfo: state.user.userInfo
});

export default connect(mapStateToProps)(RoleRoute);
