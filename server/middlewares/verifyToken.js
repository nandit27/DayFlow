import jwt from "jsonwebtoken";
import APIError from "../utils/APIError.js";
import logger from "../utils/logger.js";
export const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      throw new APIError(401, "Unauthorized - No token found");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      throw new APIError(401, "Unauthorized - Invalid token");
    }
    req.userId = decoded.userId;
    next();
  } catch (error) {
    logger.error("Error in verifyToken middleware", error);
    next(error);
  }
};
