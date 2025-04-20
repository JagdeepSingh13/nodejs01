const logger = require("../utils/logger");
const jwt = require("jsonwebtoken");

const validateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  // stored as (bearer token)
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    logger.warn("access attempt without valid token");
    return res.status(401).json({ success: false, message: "Auth required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.warn("Invalid token");
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    req.user = user;
    next();
  });
};

module.exports = { validateToken };
