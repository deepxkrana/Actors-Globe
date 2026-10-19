import "dotenv/config";

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
  isProduction: process.env.NODE_ENV === "production"
};
