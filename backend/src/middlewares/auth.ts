import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import type { AuthTokenPayload } from "../types/auth.js";

// Extend Express Request type to include user payload
declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let token: string | undefined;

  // 1. Check HttpOnly cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // 2. Check Authorization Bearer header (supports API clients/tests)
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    }
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Authentication required"
    });
    return;
  }

  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired session. Please log in again."
    });
    return;
  }

  req.user = payload;
  next();
};

export const authorizeRole = (...allowedRoles: Array<"ACTOR" | "CASTER">) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required"
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "Forbidden: You do not have permission to access this resource"
      });
      return;
    }

    next();
  };
};
