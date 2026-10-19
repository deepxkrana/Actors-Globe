import { Router } from "express";
import {
  createCastingRequestHandler,
  getActorCastingRequestsHandler,
  getCasterSentCastingRequestsHandler,
  getCastingRequestByIdHandler,
  respondToCastingRequestHandler,
  withdrawCastingRequestHandler
} from "../controllers/casting-request.controller.js";
import { authenticate, authorizeRole } from "../middlewares/auth.js";
import { validate, validateQuery } from "../middlewares/validate.js";
import {
  createCastingRequestSchema,
  updateCastingRequestStatusSchema,
  castingRequestQuerySchema
} from "../validators/casting-request.validator.js";

const router = Router();

// Caster sends casting request to actor
router.post(
  "/",
  authenticate,
  authorizeRole("CASTER"),
  validate(createCastingRequestSchema),
  createCastingRequestHandler
);

// Actor views received casting requests
router.get(
  "/my-requests",
  authenticate,
  authorizeRole("ACTOR"),
  validateQuery(castingRequestQuerySchema),
  getActorCastingRequestsHandler
);

// Caster views sent casting requests
router.get(
  "/sent",
  authenticate,
  authorizeRole("CASTER"),
  validateQuery(castingRequestQuerySchema),
  getCasterSentCastingRequestsHandler
);

// View single casting request details (accessible by sender caster or recipient actor)
router.get(
  "/:requestId",
  authenticate,
  getCastingRequestByIdHandler
);

// Actor responds to casting request (ACCEPTED or REJECTED)
router.patch(
  "/:requestId/respond",
  authenticate,
  authorizeRole("ACTOR"),
  validate(updateCastingRequestStatusSchema),
  respondToCastingRequestHandler
);

// Caster withdraws a pending casting request
router.delete(
  "/:requestId",
  authenticate,
  authorizeRole("CASTER"),
  withdrawCastingRequestHandler
);

export default router;
