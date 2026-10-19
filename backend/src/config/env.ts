import "dotenv/config";
import path from "node:path";

const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${key} is required but not defined.`);
  }
  return value;
};

export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: getEnv("DATABASE_URL"),
  jwtSecret:
    process.env.JWT_SECRET ||
    (process.env.NODE_ENV === "production"
      ? getEnv("JWT_SECRET")
      : "actorsglobe_dev_jwt_secret_key_change_in_production_123!"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  isProduction: process.env.NODE_ENV === "production",

  // Storage
  storageDriver: (process.env.STORAGE_DRIVER || "local") as "local" | "s3",
  uploadsDir: process.env.STORAGE_LOCAL_DIR || path.join(process.cwd(), "uploads"),
  s3: {
    bucket: process.env.S3_BUCKET || "",
    region: process.env.S3_REGION || "us-east-1",
    endpoint: process.env.S3_ENDPOINT || undefined,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
  }
};
