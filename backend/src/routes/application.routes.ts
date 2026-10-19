import { Router } from "express";
import {
  applyToRoleHandler,
  getActorApplicationsHandler,
  getCasterRoleApplicationsHandler,
  getApplicationByIdHandler,
  updateApplicationStatusHandler,
  withdrawApplicationHandler
} from "../controllers/application.controller.js";
import { authenticate, authorizeRole } from "../middlewares/auth.js";
import { validate, validateQuery } from "../middlewares/validate.js";
import {
  applyToRoleSchema,
  updateApplicationStatusSchema,
  applicationQuerySchema
} from "../validators/application.validator.js";

const router = Router();

// Actor applies to a casting role
router.post(
  "/",
  authenticate,
  authorizeRole("ACTOR"),
  validate(applyToRoleSchema),
  applyToRoleHandler
);

// Actor views their own submitted applications
router.get(
  "/my-applications",
  authenticate,
  authorizeRole("ACTOR"),
  validateQuery(applicationQuerySchema),
  getActorApplicationsHandler
);

// Caster views applications received for a role
router.get(
  "/role/:roleId",
  authenticate,
  authorizeRole("CASTER"),
  validateQuery(applicationQuerySchema),
  getCasterRoleApplicationsHandler
);

// View single application details (accessible by applicant actor or project caster)
router.get(
  "/:applicationId",
  authenticate,
  getApplicationByIdHandler
);

// Caster updates application status (ACCEPTED or REJECTED)
router.patch(
  "/:applicationId/status",
  authenticate,
  authorizeRole("CASTER"),
  validate(updateApplicationStatusSchema),
  updateApplicationStatusHandler
);

// Actor withdraws a pending application
router.delete(
  "/:applicationId",
  authenticate,
  authorizeRole("ACTOR"),
  withdrawApplicationHandler
);

export default router;
