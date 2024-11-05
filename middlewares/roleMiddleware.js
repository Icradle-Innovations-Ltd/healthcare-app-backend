const roles = require("../config/roles");

function roleMiddleware(requiredRole) {
  return (req, res, next) => {
    const userRole = req.user.role; // Assume role is set on req.user after authentication

    if (roles[userRole].permissions.includes(requiredRole)) {
      next();
    } else {
      res.status(403).json({ error: "Access denied" });
    }
  };
}

module.exports = roleMiddleware;
