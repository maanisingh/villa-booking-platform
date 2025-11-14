const e = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// ✅ Verify Admin Token
exports.verifyAdmin = (req, res, next) => {
  // ✅ Check header case-insensitively
  const authHeader = req.headers.authorization || req.headers.Authorization;
  console.log("🧾 AUTH HEADER (Admin):", authHeader); // debug log

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  // ✅ Handle both “Bearer token” or raw token
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  if (!token || token === "undefined") {
    return res.status(401).json({ message: "Invalid token format" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Only admin can perform this action" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ Admin Token Error:", error.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// ✅ Verify Owner Token
exports.verifyOwner = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  console.log("🧾 AUTH HEADER (Owner):", authHeader); // debug log

  if (!authHeader) {
    console.log(error);
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  if (!token || token === "undefined") {
    return res.status(401).json({ message: "Invalid token format" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "owner") {
      return res.status(403).json({ message: "Only owners can access this route" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ Owner Token Error:", error.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
