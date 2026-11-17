import type { Request, Response, NextFunction } from "express";
import { verifyAdminToken } from "../utils/jwt.js";
import prisma from "../config/prisma.js";
import type { AdminTokenPayload } from "../types/admin.js";

// Extend Express Request type to include admin payload
declare global {
  namespace Express {
    interface Request {
      admin?: AdminTokenPayload;
    }
  }
}

export const authenticateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;

  // 1. Check HttpOnly cookie
  if (req.cookies && req.cookies.adminToken) {
    token = req.cookies.adminToken;
  }

  // 2. Check Authorization Bearer header
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    }
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Admin authentication required"
    });
    return;
  }

  const payload = verifyAdminToken(token);
  if (!payload || payload.role !== "ADMIN") {
    res.status(403).json({
      success: false,
      message: "Forbidden: Invalid or unauthorized admin credentials"
    });
    return;
  }

  // Verify that the admin account actually exists in the database
  const admin = await prisma.admin.findUnique({
    where: { id: payload.adminId }
  });

  if (!admin) {
    res.status(403).json({
      success: false,
      message: "Forbidden: Admin account not found"
    });
    return;
  }

  req.admin = {
    adminId: admin.id,
    email: admin.email,
    name: admin.name,
    role: "ADMIN"
  };

  next();
};
