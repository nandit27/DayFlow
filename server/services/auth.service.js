import logger from "../utils/logger.js";
import User from "../models/user.model.js";
import APIError from "../utils/APIError.js";
import mongoose from "mongoose";
import crypto from "crypto";
import "dotenv/config";
import { generateTokenAndSetCookie } from "../utils/tokenAndSetCookie.js";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendResetPasswordEmail,
  sendResetSuccessEmail,
} from "../mailtrap/emails.js";

const CLIENT_URL = process.env.CLIENT_URL;

const generateVerificationToken = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const signupUser = async ({ name, email, password }) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      if (!name || !email || !password) {
        throw new APIError(400, "All fields are required");
      }

      if (password.length < 6) {
        throw new APIError(400, "Password must be at least 6 characters");
      }

      const existingUser = await User.findOne({ email }).session(session);
      if (existingUser) {
        throw new APIError(400, "User already exists");
      }

      const verificationToken = generateVerificationToken();
      const user = new User({
        name,
        email,
        password,
        verificationToken,
        verificationTokenExpiresAt: Date.now() + 1 * 60 * 60 * 1000,
      });

      await user.save({ session });
      await sendVerificationEmail(user.email, verificationToken);
      await session.commitTransaction();
      return user;
    });
  } finally {
    session.endSession();
  }
};

export const verifyUserEmail = async (code) => {
  const user = await User.findOne({
    verificationToken: code,
    verificationTokenExpiresAt: { $gt: Date.now() },
  });

  if (!user) {
    throw new APIError(400, "Invalid verification code");
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpiresAt = undefined;
  await user.save();

  await sendWelcomeEmail(user.email, user.name);
  return user;
};

export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new APIError(400, "All fields are required");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new APIError(400, "User not found");
  }

  if (!user.isVerified) {
    throw new APIError(400, "User is not verified");
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new APIError(400, "Invalid credentials");
  }

  user.lastLogin = new Date();
  await user.save();

  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};

export const logoutUser = () => {
  // No business logic needed (cookie clearing is handled in the controller)
};

export const forgotPasswordUser = async (email) => {
  const session = await mongoose.startSession();
  try {
    return await session.withTransaction(async () => {
      const user = await User.findOne({ email }).session(session);
      if (!user) {
        throw new APIError(400, "User not found");
      }

      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpiresAt = Date.now() + 1 * 60 * 60 * 1000;
      await user.save({ session });

      await sendResetPasswordEmail(
        user.email,
        `${CLIENT_URL}/reset-password/${rawToken}`
      );
      return rawToken;
    });
  } finally {
    session.endSession();
  }
};

export const resetPasswordUser = async (token, password) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpiresAt: { $gt: Date.now() },
      }).session(session);

      if (!user) {
        throw new APIError(400, "Invalid token");
      }

      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpiresAt = undefined;
      await user.save({ session });

      await sendResetSuccessEmail(user.email);
      return user;
    });
  } finally {
    session.endSession();
  }
};

export const checkAuthUser = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new APIError(400, "User not found");
  }
  return user;
};
