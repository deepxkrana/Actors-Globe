import { Router } from "express";
import {
  submitReport,
  getMyReports
} from "../controllers/report.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { validate, validateQuery } from "../middlewares/validate.js";
import {
  createReportSchema,
  myReportsQuerySchema
} from "../validators/report.validator.js";

const router = Router();

// Submit a new moderation report
router.post("/", authenticate, validate(createReportSchema), submitReport);

// View submitted reports and resolution status for authenticated user
router.get("/my-reports", authenticate, validateQuery(myReportsQuerySchema), getMyReports);

export default router;
