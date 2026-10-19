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
