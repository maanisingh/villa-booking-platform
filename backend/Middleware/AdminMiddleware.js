/**
 * Admin Authorization Middleware
 *
 * Verifies that the authenticated user has admin privileges
 */

const adminAuth = (req, res, next) => {
  try {
    // Check if user is authenticated (handled by AuthMiddleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    // Check if user has admin role
    const userRole = req.user.role || req.user.userRole;

    if (userRole !== "admin" && userRole !== "Admin" && userRole !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required."
      });
    }

    // User is admin, proceed to next middleware/route handler
    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Authorization check failed",
      error: error.message
    });
  }
};

module.exports = adminAuth;
