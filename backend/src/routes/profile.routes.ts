import { Router } from "express";
import {
  getMetadataHandler,
  createActorProfileHandler,
  getMyActorProfileHandler,
  updateActorProfileHandler,
  getPublicActorProfileHandler,
  createCasterProfileHandler,
  getMyCasterProfileHandler,
  updateCasterProfileHandler,
  getPublicCasterProfileHandler,
  addExperienceHandler,
  getMyExperiencesHandler,
  updateExperienceHandler,
  deleteExperienceHandler
} from "../controllers/profile.controller.js";
import { authenticate, authorizeRole } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  createActorProfileSchema,
  updateActorProfileSchema,
  createCasterProfileSchema,
  updateCasterProfileSchema,
  createExperienceSchema,
  updateExperienceSchema
} from "../validators/profile.validator.js";

const router = Router();

// Metadata (skills, genders, sexual orientations)
router.get("/metadata", getMetadataHandler);

// Unified Profile Routes (resolves automatically based on JWT role)
router.get("/me", authenticate, async (req, res) => {
  if (req.user?.role === "ACTOR") {
    return getMyActorProfileHandler(req, res);
  } else if (req.user?.role === "CASTER") {
    return getMyCasterProfileHandler(req, res);
  } else {
    res.status(400).json({ success: false, message: "Invalid user role" });
  }
});

router.put("/me", authenticate, async (req, res) => {
  if (req.user?.role === "ACTOR") {
    return updateActorProfileHandler(req, res);
  } else if (req.user?.role === "CASTER") {
    return updateCasterProfileHandler(req, res);
  } else {
    res.status(400).json({ success: false, message: "Invalid user role" });
  }
});

// -------------------------------------------------------------
// Actor Profile Routes
// -------------------------------------------------------------

router.post(
  "/actor",
  authenticate,
  authorizeRole("ACTOR"),
  validate(createActorProfileSchema),
  createActorProfileHandler
);

router.get(
  "/actor/me",
  authenticate,
  authorizeRole("ACTOR"),
  getMyActorProfileHandler
);

router.put(
  "/actor/me",
  authenticate,
  authorizeRole("ACTOR"),
  validate(updateActorProfileSchema),
  updateActorProfileHandler
);

router.get("/actor/:id", getPublicActorProfileHandler);

// Actor Experience Sub-Resource
router.post(
  "/actor/me/experiences",
  authenticate,
  authorizeRole("ACTOR"),
  validate(createExperienceSchema),
  addExperienceHandler
);

router.get(
  "/actor/me/experiences",
  authenticate,
  authorizeRole("ACTOR"),
  getMyExperiencesHandler
);

router.put(
  "/actor/me/experiences/:experienceId",
  authenticate,
  authorizeRole("ACTOR"),
  validate(updateExperienceSchema),
  updateExperienceHandler
);

router.delete(
  "/actor/me/experiences/:experienceId",
  authenticate,
  authorizeRole("ACTOR"),
  deleteExperienceHandler
);

// -------------------------------------------------------------
// Caster Profile Routes
// -------------------------------------------------------------

router.post(
  "/caster",
  authenticate,
  authorizeRole("CASTER"),
  validate(createCasterProfileSchema),
  createCasterProfileHandler
);

router.get(
  "/caster/me",
  authenticate,
  authorizeRole("CASTER"),
  getMyCasterProfileHandler
);

router.put(
  "/caster/me",
  authenticate,
  authorizeRole("CASTER"),
  validate(updateCasterProfileSchema),
  updateCasterProfileHandler
);

router.get("/caster/:id", getPublicCasterProfileHandler);

export default router;
