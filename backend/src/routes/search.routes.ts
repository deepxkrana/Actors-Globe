import { Router } from "express";
import {
  searchActorsHandler,
  searchProjectsHandler,
  searchRolesHandler,
  getSearchFilterMetadataHandler
} from "../controllers/search.controller.js";
import { validateQuery } from "../middlewares/validate.js";
import {
  searchActorsSchema,
  searchProjectsSchema,
  searchRolesSchema
} from "../validators/search.validator.js";

const router = Router();

// Metadata & filter options for search UI
router.get("/filters", getSearchFilterMetadataHandler);

// Public actor discovery (privacy-sanitized)
router.get("/actors", validateQuery(searchActorsSchema), searchActorsHandler);

// Public project discovery (published projects only)
router.get("/projects", validateQuery(searchProjectsSchema), searchProjectsHandler);

// Public casting role discovery (open roles in published projects)
router.get("/roles", validateQuery(searchRolesSchema), searchRolesHandler);

export default router;
