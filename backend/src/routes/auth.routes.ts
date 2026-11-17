import { Router } from "express";
import {
  login,
  register,
  me,
  logout,
  verifyEmailHandler,
  verifyPhoneHandler,
  resendVerificationHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
  deactivateHandler
} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/auth.js";
import { authRateLimiter } from "../middlewares/rateLimiter.js";
import {
  loginSchema,
  registerSchema,
  verifyEmailSchema,
  verifyPhoneSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from "../validators/auth.validator.js";

const router = Router();

// Core authentication
router.post("/register", authRateLimiter, validate(registerSchema), register);
router.post("/login", authRateLimiter, validate(loginSchema), login);
router.get("/me", authenticate, me);
router.post("/logout", logout);

// Verification lifecycle
router.post(
  "/verify-email",
  authenticate,
  validate(verifyEmailSchema),
  verifyEmailHandler
);
router.post(
  "/verify-phone",
  authenticate,
  validate(verifyPhoneSchema),
  verifyPhoneHandler
);
router.post(
  "/resend-verification",
  authenticate,
  authRateLimiter,
  validate(resendVerificationSchema),
  resendVerificationHandler
);

// Password reset lifecycle
router.post(
  "/forgot-password",
  authRateLimiter,
  validate(forgotPasswordSchema),
  forgotPasswordHandler
);
router.post(
  "/reset-password",
  authRateLimiter,
  validate(resetPasswordSchema),
  resetPasswordHandler
);

// Account lifecycle
router.post("/deactivate", authenticate, deactivateHandler);

export default router;