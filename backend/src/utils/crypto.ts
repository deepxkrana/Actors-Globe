import crypto from "node:crypto";

export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const generateNumericCode = (length = 6): string => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return crypto.randomInt(min, max + 1).toString();
};

export const generateSecureToken = (bytes = 32): string => {
  return crypto.randomBytes(bytes).toString("hex");
};
