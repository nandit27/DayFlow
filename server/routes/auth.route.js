import express from "express";
import {
  login,
  logout,
  signup,
  verifyEmail,
  forgotPassword,
  resetPassword,
  checkAuth,
} from "../controllers/auth.controller.js";
import {
  forgotPasswordLimiter,
  loginLimiter,
  signupLimiter,
  verifyLimiter,
} from "../middlewares/rateLimiter.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { validateRoutes } from "../middlewares/routeValidator.js";

const authRouter = express.Router();

authRouter.get("/check-auth", verifyToken, checkAuth);
authRouter.post("/signup", signupLimiter, signup);
authRouter.post("/verify-email", verifyLimiter, verifyEmail);
authRouter.post("/login", loginLimiter, login);
authRouter.post("/logout", logout);
authRouter.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
authRouter.post("/reset-password/:token", resetPassword);
validateRoutes(authRouter);
export default authRouter;
