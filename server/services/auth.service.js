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

// Generate Employee ID in format: OI[FirstTwoLettersOfFirstName][FirstTwoLettersOfLastName][Year][SerialNumber]
// Example: OIOD20220001 for employee named "Odessa Dooly" joining in 2022
const generateEmployeeId = async (name, companyName) => {
  const nameParts = name.trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts[nameParts.length - 1] || nameParts[0];
  
  // Get first two letters of first and last name
  const firstInitials = (firstName.substring(0, 2) || 'XX').toUpperCase();
  const lastInitials = (lastName.substring(0, 2) || 'XX').toUpperCase();
  
  // Get company initials (first two letters)
  const companyInitials = (companyName.substring(0, 2) || 'OI').toUpperCase();
  
  // Get current year
  const year = new Date().getFullYear();
  
  // Find the last employee ID for this year to generate serial number
  const lastEmployee = await User.findOne({
    employeeId: new RegExp(`^${companyInitials}${firstInitials}${lastInitials}${year}`, 'i')
  }).sort({ employeeId: -1 });
  
  let serialNumber = 1;
  if (lastEmployee && lastEmployee.employeeId) {
    const lastSerial = parseInt(lastEmployee.employeeId.slice(-4));
    if (!isNaN(lastSerial)) {
      serialNumber = lastSerial + 1;
    }
  }
  
  // Format serial number as 4-digit string
  const serialStr = serialNumber.toString().padStart(4, '0');
  
  return `${companyInitials}${firstInitials}${lastInitials}${year}${serialStr}`;
};

// Validate password strength
const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password must not exceed 128 characters');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }
  
  return errors;
};

export const signupUser = async ({ companyName, name, email, phone, password, role }) => {
  try {
    // Validate all required fields
    if (!companyName || !name || !email || !phone || !password) {
      throw new APIError(400, "All fields are required");
    }

    // Validate password strength
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      throw new APIError(400, passwordErrors.join('. '));
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new APIError(400, "User already exists");
    }

    // Generate Employee ID
    const employeeId = await generateEmployeeId(name, companyName);

    // Generate verification token
    const verificationToken = generateVerificationToken();
    
    // Create new user
    const user = new User({
      employeeId,
      companyName,
      name,
      email,
      phone,
      password,
      role: role || 'Employee', // Default to Employee if not provided
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 1 * 60 * 60 * 1000,
    });

    await user.save();
    await sendVerificationEmail(user.email, verificationToken);
    return user;
  } catch (error) {
    logger.error('Error in signupUser service:', error);
    throw error;
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

  // Check if email is actually an employeeId (doesn't contain @)
  const isEmployeeId = !email.includes('@');
  
  // Find user by either email or employeeId
  const user = await User.findOne(
    isEmployeeId ? { employeeId: email } : { email }
  ).select("+password");
  
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
  try {
    const user = await User.findOne({ email });
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
    await user.save();

    await sendResetPasswordEmail(
      user.email,
      `${CLIENT_URL}/reset-password/${rawToken}`
    );
    return rawToken;
  } catch (error) {
    logger.error('Error in forgotPasswordUser service:', error);
    throw error;
  }
};

export const resetPasswordUser = async (token, password) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      throw new APIError(400, "Invalid token");
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    await sendResetSuccessEmail(user.email);
    return user;
  } catch (error) {
    logger.error('Error in resetPasswordUser service:', error);
    throw error;
  }
};

export const checkAuthUser = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new APIError(400, "User not found");
  }
  return user;
};
