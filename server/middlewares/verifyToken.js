import jwt from "jsonwebtoken";
import APIError from "../utils/APIError.js";
import logger from "../utils/logger.js";
import User from "../models/user.model.js";

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      throw new APIError(401, "Unauthorized - No token found");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      throw new APIError(401, "Unauthorized - Invalid token");
    }

    // Fetch user to get role
    const user = await User.findById(decoded.userId).select("role");
    if (!user) {
      throw new APIError(401, "Unauthorized - User not found");
    }

    req.userId = decoded.userId;
    req.userRole = user.role;
    next();
  } catch (error) {
    logger.error("Error in verifyToken middleware", error);
    next(error);
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    try {
      if (!roles.includes(req.userRole)) {
        throw new APIError(403, `Access denied. Required role: ${roles.join(" or ")}`);
      }
      next();
    } catch (error) {
      logger.error("Error in authorizeRoles middleware", error);
      next(error);
    }
  };
};
