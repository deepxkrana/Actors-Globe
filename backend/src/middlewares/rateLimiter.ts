import rateLimit from "express-rate-limit";
import { config } from "../config/env.js";

// Rate limiter for authentication endpoints (prevent brute-force)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.nodeEnv === "test" ? 1000 : 20, // Strict in dev/prod, relaxed in test
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again after 15 minutes."
  }
});
