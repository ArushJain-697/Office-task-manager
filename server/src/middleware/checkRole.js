const VALID_ROLES = new Set(["admin", "user"]);

function checkRole(...allowedRoles) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role || !VALID_ROLES.has(role) || !allowedRoles.includes(role)) {
      return res.status(403).json({ message: "Access denied. Insufficient role." });
    }
    return next();
  };
}

module.exports = { checkRole };