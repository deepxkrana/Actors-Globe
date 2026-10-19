import type { Request, Response } from "express";
import {
  createActorProfile,
  getActorProfileByUserId,
  getPublicActorProfileById,
  updateActorProfile,
  createCasterProfile,
  getCasterProfileByUserId,
  getPublicCasterProfileById,
  updateCasterProfile,
  addExperience,
  getExperiencesByUserId,
  updateExperience,
  deleteExperience
} from "../services/profile.service.js";
import { SKILLS, GENDERS, SEXUAL_ORIENTATIONS } from "../validators/profile.validator.js";

export const getMetadataHandler = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    skills: SKILLS,
    genders: GENDERS,
    sexualOrientations: SEXUAL_ORIENTATIONS
  });
};

// -------------------------------------------------------------
// Actor Profile Handlers
// -------------------------------------------------------------

export const createActorProfileHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const profile = await createActorProfile(req.user.userId, req.body);

    res.status(201).json({
      success: true,
      message: "Actor profile created successfully",
      profile
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create actor profile";
    const statusCode = message.includes("already exists") ? 409 : message.includes("Forbidden") ? 403 : 400;

    res.status(statusCode).json({
      success: false,
      message
    });
  }
};

export const getMyActorProfileHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const profile = await getActorProfileByUserId(req.user.userId);

    if (!profile) {
      res.status(404).json({
        success: false,
        message: "Actor profile not found. Please create one."
      });
      return;
    }

    res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch actor profile";
    res.status(500).json({ success: false, message });
  }
};

export const updateActorProfileHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const profile = await updateActorProfile(req.user.userId, req.body);

    res.status(200).json({
      success: true,
      message: "Actor profile updated successfully",
      profile
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update actor profile";
    const statusCode = message.includes("not found") ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message
    });
  }
};

export const getPublicActorProfileHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const profile = await getPublicActorProfileById(id);

    if (!profile) {
      res.status(404).json({
        success: false,
        message: "Actor profile not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch public profile";
    res.status(500).json({ success: false, message });
  }
};

// -------------------------------------------------------------
// Caster Profile Handlers
// -------------------------------------------------------------

export const createCasterProfileHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const profile = await createCasterProfile(req.user.userId, req.body);

    res.status(201).json({
      success: true,
      message: "Caster profile created successfully",
      profile
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create caster profile";
    const statusCode = message.includes("already exists") ? 409 : message.includes("Forbidden") ? 403 : 400;

    res.status(statusCode).json({
      success: false,
      message
    });
  }
};

export const getMyCasterProfileHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const profile = await getCasterProfileByUserId(req.user.userId);

    if (!profile) {
      res.status(404).json({
        success: false,
        message: "Caster profile not found. Please create one."
      });
      return;
    }

    res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch caster profile";
    res.status(500).json({ success: false, message });
  }
};

export const updateCasterProfileHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const profile = await updateCasterProfile(req.user.userId, req.body);

    res.status(200).json({
      success: true,
      message: "Caster profile updated successfully",
      profile
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update caster profile";
    const statusCode = message.includes("not found") ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message
    });
  }
};

export const getPublicCasterProfileHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const profile = await getPublicCasterProfileById(id);

    if (!profile) {
      res.status(404).json({
        success: false,
        message: "Caster profile not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch caster profile";
    res.status(500).json({ success: false, message });
  }
};

// -------------------------------------------------------------
// Experience Handlers (Actor Only)
// -------------------------------------------------------------

export const addExperienceHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const experience = await addExperience(req.user.userId, req.body);

    res.status(201).json({
      success: true,
      message: "Experience added successfully",
      experience
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add experience";
    const statusCode = message.includes("not found") ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message
    });
  }
};

export const getMyExperiencesHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const experiences = await getExperiencesByUserId(req.user.userId);

    res.status(200).json({
      success: true,
      experiences
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch experiences";
    const statusCode = message.includes("not found") ? 404 : 500;

    res.status(statusCode).json({
      success: false,
      message
    });
  }
};

export const updateExperienceHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const experienceId = req.params.experienceId as string;
    const experience = await updateExperience(req.user.userId, experienceId, req.body);

    res.status(200).json({
      success: true,
      message: "Experience updated successfully",
      experience
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update experience";
    const statusCode = message.includes("Forbidden") ? 403 : message.includes("not found") ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message
    });
  }
};

export const deleteExperienceHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const experienceId = req.params.experienceId as string;
    await deleteExperience(req.user.userId, experienceId);

    res.status(200).json({
      success: true,
      message: "Experience deleted successfully"
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete experience";
    const statusCode = message.includes("Forbidden") ? 403 : message.includes("not found") ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message
    });
  }
};
