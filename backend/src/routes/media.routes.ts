import { Router } from "express";
import {
  uploadMediaHandler,
  getMyMediaHandler,
  getActorPublicMediaHandler,
  deleteMediaHandler
} from "../controllers/media.controller.js";
import { authenticate, authorizeRole } from "../middlewares/auth.js";
import { uploadMediaMiddleware } from "../middlewares/upload.js";

const router = Router();

// Upload portfolio media (actor only)
router.post(
  "/",
  authenticate,
  authorizeRole("ACTOR"),
  uploadMediaMiddleware,
  uploadMediaHandler
);

// Get authenticated actor's media
router.get(
  "/me",
  authenticate,
  authorizeRole("ACTOR"),
  getMyMediaHandler
);

// Get actor's public media by actor ID
router.get(
  "/actor/:actorId",
  getActorPublicMediaHandler
);

// Delete media (actor ownership enforced)
router.delete(
  "/:mediaId",
  authenticate,
  authorizeRole("ACTOR"),
  deleteMediaHandler
);

export default router;
