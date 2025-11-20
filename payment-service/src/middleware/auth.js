/**
  check user login
 */

const authMiddleware = (req, res, next) => {
  try {
    const userId = req.query.userId || req.body.userId || req.headers['x-user-id'];

    console.log('[Auth Middleware] Checking auth:', {
      method: req.method,
      path: req.path,
      query: req.query,
      body: req.body,
      headers: {
        'x-user-id': req.headers['x-user-id'],
        'authorization': req.headers['authorization']
      },
      userId
    });

    if (!userId) {
      console.log('[Auth Middleware] ❌ No userId found, returning 401');
      return res.status(401).json({
        success: false,
        message: 'Không có quyền truy cập'
      });
    }

    console.log('[Auth Middleware] ✅ Auth passed for userId:', userId);
    req.user = { id: parseInt(userId) };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Lỗi xác thực'
    });
  }
};

module.exports = { authMiddleware };
