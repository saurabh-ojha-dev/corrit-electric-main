const roleCheck = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if admin exists and has a role
      if (!req.admin || !req.admin.role) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. Admin role not found.'
        });
      }

      // Check if admin's role is in the allowed roles
      if (!allowedRoles.includes(req.admin.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.'
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during role verification.'
      });
    }
  };
};

module.exports = roleCheck;
