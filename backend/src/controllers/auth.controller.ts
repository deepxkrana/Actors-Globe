import type { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  getUserById,
  verifyEmail,
  verifyPhone,
  resendVerification,
  forgotPassword,
  resetPassword,
  deactivateUser
} from "../services/auth.service.js";
import { signToken } from "../utils/jwt.js";
import { config } from "../config/env.js";
import type {
  LoginInput,
  VerifyEmailInput,
  VerifyPhoneInput,
  ResendVerificationInput,
  ForgotPasswordInput,
  ResetPasswordInput
} from "../types/auth.js";

const COOKIE_NAME = "token";

const getCookieOptions = () => ({
  httpOnly: true,
  secure: config.isProduction,
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user, initialEmailCode } = await registerUser(req.body);

    const token = signToken({
      userId: user.id,
      role: user.role,
      email: user.email
    });

    res.cookie(COOKIE_NAME, token, getCookieOptions());

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user,
      devVerificationCode: config.isProduction ? undefined : initialEmailCode
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Registration failed";

    const statusCode = message.includes("already exists") ? 409 : 400;

    res.status(statusCode).json({
      success: false,
      message
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as LoginInput;

    const user = await loginUser(email, password);

    const token = signToken({
      userId: user.id,
      role: user.role,
      email: user.email
    });

    res.cookie(COOKIE_NAME, token, getCookieOptions());

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Login failed";

    const statusCode = message.includes("deactivated") ? 403 : 401;

    res.status(statusCode).json({
      success: false,
      message
    });
  }
};

export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required"
      });
      return;
    }

    const user = await getUserById(req.user.userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User account not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch user profile";

    res.status(500).json({
      success: false,
      message
    });
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: "lax"
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
};

export const verifyEmailHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required"
      });
      return;
    }

    const { code } = req.body as VerifyEmailInput;
    const user = await verifyEmail(req.user.userId, code);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Email verification failed";

    res.status(400).json({
      success: false,
      message
    });
  }
};

export const verifyPhoneHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required"
      });
      return;
    }

    const { code } = req.body as VerifyPhoneInput;
    const user = await verifyPhone(req.user.userId, code);

    res.status(200).json({
      success: true,
      message: "Phone number verified successfully",
      user
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Phone verification failed";

    res.status(400).json({
      success: false,
      message
    });
  }
};

export const resendVerificationHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required"
      });
      return;
    }

    const { type } = req.body as ResendVerificationInput;
    const result = await resendVerification(req.user.userId, type);

    res.status(200).json({
      success: true,
      message: `Verification code for ${type.toLowerCase()} sent successfully`,
      devVerificationCode: config.isProduction ? undefined : result.plainCode
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to resend verification code";

    res.status(400).json({
      success: false,
      message
    });
  }
};

export const forgotPasswordHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body as ForgotPasswordInput;
    const result = await forgotPassword(email);

    res.status(200).json({
      success: true,
      message: "If an account with this email exists, a password reset token has been sent.",
      devResetToken: config.isProduction ? undefined : result.plainToken
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Password reset request failed";

    res.status(400).json({
      success: false,
      message
    });
  }
};

export const resetPasswordHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body as ResetPasswordInput;
    await resetPassword(token, newPassword);

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully. Please log in with your new password."
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Password reset failed";

    res.status(400).json({
      success: false,
      message
    });
  }
};

export const deactivateHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required"
      });
      return;
    }

    await deactivateUser(req.user.userId);

    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: "lax"
    });

    res.status(200).json({
      success: true,
      message: "Account has been deactivated successfully"
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Account deactivation failed";

    res.status(500).json({
      success: false,
      message
    });
  }
};