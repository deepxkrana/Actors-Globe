import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import prisma from "./config/prisma.js";
import { config } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import mediaRoutes from "./routes/media.routes.js";
import projectRoutes from "./routes/project.routes.js";
import searchRoutes from "./routes/search.routes.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true
  })
);
app.use(cookieParser());
app.use(express.json());

// Static file serving for local media storage
app.use("/uploads", express.static(config.uploadsDir));

app.use("/api/auth", authRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/search", searchRoutes);

app.get("/api/health", async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      message: "Casting Platform API is running",
      database: "connected"
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Database connection failed"
    });
  }
});

// Centralized error handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const message =
    err instanceof Error ? err.message : "An unexpected server error occurred";

  res.status(500).json({
    success: false,
    message
  });
});

export default app;