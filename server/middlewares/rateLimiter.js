import rateLimit from "express-rate-limit";

// 🔒 Signup limiter - e.g., 5 attempts per hour per IP
export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    success: false,
    error:
      "Too many signup attempts from this IP, please try again after an hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 🔒 Login limiter - e.g., 10 attempts every 15 minutes per IP
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 10,
  message: {
    success: false,
    error: "Too many login attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 🔒 Email verification limiter - 5 per hour per IP
export const verifyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    success: false,
    error: "Too many verification attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    success: false,
    message:
      "Too many password reset requests from this IP. Please try again after an hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const globalRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again after an hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
