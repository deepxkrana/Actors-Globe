import jwt from "jsonwebtoken";
import type { SignOptions, VerifyOptions } from "jsonwebtoken";
import { config } from "../config/env.js";
import type { AuthTokenPayload } from "../types/auth.js";

const JWT_ISSUER = "actorsglobe";
const JWT_AUDIENCE = "actorsglobe-users";

export const signToken = (payload: AuthTokenPayload): string => {
  const options: SignOptions = {
    algorithm: "HS256",
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    expiresIn: config.jwtExpiresIn as any
  };

  return jwt.sign(payload, config.jwtSecret, options);
};

export const verifyToken = (token: string): AuthTokenPayload | null => {
  try {
    const options: VerifyOptions = {
      algorithms: ["HS256"],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE
    };

    const decoded = jwt.verify(token, config.jwtSecret, options) as AuthTokenPayload;
    if (!decoded.userId || !decoded.role || !decoded.email) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
};

const JWT_ADMIN_AUDIENCE = "actorsglobe-admins";

import type { AdminTokenPayload } from "../types/admin.js";

export const signAdminToken = (payload: AdminTokenPayload): string => {
  const options: SignOptions = {
    algorithm: "HS256",
    issuer: JWT_ISSUER,
    audience: JWT_ADMIN_AUDIENCE,
    expiresIn: "12h"
  };

  return jwt.sign(payload, config.jwtSecret, options);
};

export const verifyAdminToken = (token: string): AdminTokenPayload | null => {
  try {
    const options: VerifyOptions = {
      algorithms: ["HS256"],
      issuer: JWT_ISSUER,
      audience: JWT_ADMIN_AUDIENCE
    };

    const decoded = jwt.verify(token, config.jwtSecret, options) as AdminTokenPayload;
    if (!decoded.adminId || decoded.role !== "ADMIN" || !decoded.email) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
};
