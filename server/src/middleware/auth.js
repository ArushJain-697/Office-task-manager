const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const token = req.cookies?.jwt;

  if (!token) {
    return res.status(401).json({ message: "Missing token. Please log in." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // Payload mein ab role bhi shamil hai!
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = {
  requireAuth,
};