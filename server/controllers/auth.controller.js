import logger from "../utils/logger.js";
import APIError from "../utils/APIError.js";
import {
  signupUser,
  verifyUserEmail,
  loginUser,
  logoutUser,
  forgotPasswordUser,
  resetPasswordUser,
  checkAuthUser,
} from "../services/auth.service.js";
import { generateTokenAndSetCookie } from "../utils/tokenAndSetCookie.js";

export const signup = async (req, res, next) => {
  logger.info("Signup controller hit...");
  try {
    const { name, email, password } = req.body;
    const user = await signupUser({ name, email, password });
    generateTokenAndSetCookie(res, user._id);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    logger.error("Error in signup controller", error);
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  logger.info("Verify email controller hit...");
  try {
    const { code } = req.body;
    const user = await verifyUserEmail(code);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    logger.error("Error in verify email controller", error);
    next(error);
  }
};

export const login = async (req, res, next) => {
  logger.info("Login controller hit...");
  try {
    const { email, password } = req.body;
    const user = await loginUser({ email, password });
    generateTokenAndSetCookie(res, user._id);

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user,
    });
  } catch (error) {
    logger.error("Error in login controller", error);
    next(error);
  }
};

export const logout = async (req, res, next) => {
  logger.info("Logout controller hit...");
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "Strict",
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    logger.error("Error in logout controller", error);
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  logger.info("Forgot password controller hit...");
  try {
    const { email } = req.body;
    const token = await forgotPasswordUser(email);

    res.status(200).json({
      success: true,
      message: "Password reset email sent successfully",
      token,
    });
  } catch (error) {
    logger.error("Error in forgot password controller", error);
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  logger.info("Reset password controller hit...");
  try {
    const { token } = req.params;
    const { password } = req.body;
    await resetPasswordUser(token, password);

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    logger.error("Error in reset password controller", error);
    next(error);
  }
};

export const checkAuth = async (req, res, next) => {
  logger.info("Check auth controller hit...");
  try {
    const user = await checkAuthUser(req.userId);
    res.status(200).json({ success: true, user });
  } catch (error) {
    logger.error("Error in check auth controller", error);
    next(error);
  }
};
