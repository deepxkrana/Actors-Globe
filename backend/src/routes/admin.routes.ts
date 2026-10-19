import { Router } from "express";
import {
  adminLogin,
  adminLogout,
  getAdminMe,
  getDashboardStats,
  getReports,
  getReportDetails,
  updateReport,
  moderateUser
} from "../controllers/admin.controller.js";
import { authenticateAdmin } from "../middlewares/adminAuth.js";
import { validate, validateQuery } from "../middlewares/validate.js";
import {
  adminLoginSchema,
  updateReportStatusSchema,
  reportFilterQuerySchema,
  userModerationSchema
} from "../validators/admin.validator.js";

const router = Router();

// Public Admin Login
router.post("/login", validate(adminLoginSchema), adminLogin);

// Protected Admin Session Routes
router.post("/logout", authenticateAdmin, adminLogout);
router.get("/me", authenticateAdmin, getAdminMe);

// Moderation Dashboard Metrics
router.get("/dashboard/stats", authenticateAdmin, getDashboardStats);

// Reports Triage & Investigation
router.get(
  "/reports",
  authenticateAdmin,
  validateQuery(reportFilterQuerySchema),
  getReports
);
router.get("/reports/:id", authenticateAdmin, getReportDetails);
router.patch(
  "/reports/:id/status",
  authenticateAdmin,
  validate(updateReportStatusSchema),
  updateReport
);

// Account Suspension / Moderation Action
router.patch(
  "/users/:id/moderation",
  authenticateAdmin,
  validate(userModerationSchema),
  moderateUser
);

export default router;
