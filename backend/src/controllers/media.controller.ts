import type { Request, Response } from "express";
import {
  uploadMedia,
  getMyMedia,
  getActorMedia,
  deleteMedia
} from "../services/media.service.js";
import { uploadMediaBodySchema, mediaQuerySchema } from "../validators/media.validator.js";
import type { MediaType } from "../types/media.js";

export const uploadMediaHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, message: "No file uploaded. Please provide a file." });
      return;
    }

    const parseResult = uploadMediaBodySchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parseResult.error.issues
      });
      return;
    }

    const { type, duration } = parseResult.data;
    const media = await uploadMedia(req.user.userId, req.file, type as MediaType, duration);

    res.status(201).json({
      success: true,
      message: "Media uploaded successfully",
      media
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Media upload failed";
    const statusCode = message.includes("not found") ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message
    });
  }
};

export const getMyMediaHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const queryResult = mediaQuerySchema.safeParse(req.query);
    const type = queryResult.success ? (queryResult.data.type as MediaType) : undefined;

    const media = await getMyMedia(req.user.userId, type);

    res.status(200).json({
      success: true,
      media
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch media";
    const statusCode = message.includes("not found") ? 404 : 500;

    res.status(statusCode).json({
      success: false,
      message
    });
  }
};

export const getActorPublicMediaHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const actorId = req.params.actorId as string;
    const queryResult = mediaQuerySchema.safeParse(req.query);
    const type = queryResult.success ? (queryResult.data.type as MediaType) : undefined;

    const media = await getActorMedia(actorId, type);

    res.status(200).json({
      success: true,
      media
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch media";
    res.status(500).json({
      success: false,
      message
    });
  }
};

export const deleteMediaHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const mediaId = req.params.mediaId as string;
    const result = await deleteMedia(req.user.userId, mediaId);

    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete media";
    const statusCode = message.includes("Forbidden") ? 403 : message.includes("not found") ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message
    });
  }
};
