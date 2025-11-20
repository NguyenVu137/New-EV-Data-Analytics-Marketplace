/**
  check user login
 */

const authMiddleware = (req, res, next) => {
  try {
    const userId = req.query.userId || req.body.userId || req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Không có quyền truy cập'
      });
    }

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
