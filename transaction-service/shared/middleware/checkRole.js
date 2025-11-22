const checkRole = (allowedRoles = []) => {
    return (req, res, next) => {
        const userRole = req.user?.roleId;

        if (!userRole) {
            return res.status(403).json({
                errCode: 1,
                message: 'User role not found'
            });
        }

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                errCode: 2,
                message: 'Access denied. Insufficient permissions.'
            });
        }

        next();
    };
};

module.exports = { checkRole };
