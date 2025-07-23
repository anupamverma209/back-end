const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../Models/User");

const auth = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      req.body?.token ||
      (req.header("Authorization") &&
      req.header("Authorization").startsWith("Bearer ")
        ? req.header("Authorization").replace("Bearer ", "")
        : null);

    if (!token) {
      return res.status(401).json({ message: "Token missing", success: false });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Unauthorized", success: false });
      }
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid token", success: false });
    }
  } catch (err) {
    console.error("Authentication error:", err);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: err.message,
    });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Admin") {
      return res.status(403).json({
        message: "Forbidden: Admin access required",
        success: false,
      });
    }
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, please try again",
    });
  }
};

const isUser = async (req, res, next) => {
  try {
    if (req.user.accountType !== "User") {
      return res.status(403).json({
        message: "Forbidden: User access required",
        success: false,
      });
    }
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, please try again",
    });
  }
};

const isSeller = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Seller") {
      return res.status(403).json({
        message: "Forbidden: Seller access required",
        success: false,
      });
    }
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, please try again",
    });
  }
};

module.exports = { auth, isAdmin, isUser, isSeller };
