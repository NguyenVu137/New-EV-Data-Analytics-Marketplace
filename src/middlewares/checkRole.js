export const checkRole = (allowedRoles) => (req, res, next) => {
    if (!req.user?.roleId) return res.status(401).json({ errCode: 1, message: 'Unauthorized' });
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!roles.includes(req.user.roleId)) return res.status(403).json({ errCode: 2, message: 'Forbidden' });
    next();
};
