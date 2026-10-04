import express from "express";
import cors from "cors";
import helmet from "helmet";
import prisma from "./config/prisma.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/api/health", async (_req, res) => {
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

export default app;