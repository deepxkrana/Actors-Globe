import { Router } from "express";
import {
  createProjectHandler,
  addCastingRoleHandler,
  updateCastingRoleHandler,
  publishProjectHandler,
  closeProjectHandler,
  updateProjectHandler,
  getMyProjectsHandler,
  getPublicProjectsHandler,
  getProjectByIdHandler,
  getRoleByIdHandler
} from "../controllers/project.controller.js";
import { authenticate, authorizeRole, optionalAuthenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  createProjectSchema,
  updateProjectSchema,
  createCastingRoleSchema,
  updateCastingRoleSchema
} from "../validators/project.validator.js";

const router = Router();

// -------------------------------------------------------------
// Public / Authenticated Discovery
// -------------------------------------------------------------

// List all published projects
router.get("/", getPublicProjectsHandler);

// Caster's own projects
router.get(
  "/my-projects",
  authenticate,
  authorizeRole("CASTER"),
  getMyProjectsHandler
);
router.get(
  "/my",
  authenticate,
  authorizeRole("CASTER"),
  getMyProjectsHandler
);

// Get single role details
router.get("/roles/:roleId", optionalAuthenticate, getRoleByIdHandler);

// Get single project details (drafts only visible to creator)
router.get("/:projectId", optionalAuthenticate, getProjectByIdHandler);

// -------------------------------------------------------------
// Caster Management Operations
// -------------------------------------------------------------

// Create new project (draft, premium caster only)
router.post(
  "/",
  authenticate,
  authorizeRole("CASTER"),
  validate(createProjectSchema),
  createProjectHandler
);

// Update project details
router.put(
  "/:projectId",
  authenticate,
  authorizeRole("CASTER"),
  validate(updateProjectSchema),
  updateProjectHandler
);

// Publish project (minimum 1 role required)
router.post(
  "/:projectId/publish",
  authenticate,
  authorizeRole("CASTER"),
  publishProjectHandler
);

// Close project and all its open casting roles
router.post(
  "/:projectId/close",
  authenticate,
  authorizeRole("CASTER"),
  closeProjectHandler
);

// -------------------------------------------------------------
// Casting Role Operations (Caster Only)
// -------------------------------------------------------------

// Add role to project
router.post(
  "/:projectId/roles",
  authenticate,
  authorizeRole("CASTER"),
  validate(createCastingRoleSchema),
  addCastingRoleHandler
);

// Update role details or close role
router.put(
  "/:projectId/roles/:roleId",
  authenticate,
  authorizeRole("CASTER"),
  validate(updateCastingRoleSchema),
  updateCastingRoleHandler
);

export default router;
