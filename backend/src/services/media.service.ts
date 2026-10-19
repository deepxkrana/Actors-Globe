import crypto from "node:crypto";
import path from "node:path";
import prisma from "../config/prisma.js";
import { getStorageProvider } from "../utils/storage.js";
import {
  ALLOWED_PHOTO_MIMES,
  ALLOWED_VIDEO_MIMES,
  MAX_PHOTO_SIZE,
  MAX_VIDEO_SIZE
} from "../validators/media.validator.js";
import type { MediaResponse, MediaType } from "../types/media.js";

const toMediaResponse = (media: any): MediaResponse => {
  const storage = getStorageProvider();
  return {
    id: media.id,
    actorId: media.actorId,
    type: media.type,
    storageKey: media.storageKey,
    originalFileName: media.originalFileName,
    mimeType: media.mimeType,
    fileSize: media.fileSize,
    duration: media.duration,
    url: storage.getUrl(media.storageKey),
    createdAt: media.createdAt,
    updatedAt: media.updatedAt
  };
};

export const uploadMedia = async (
  userId: string,
  file: Express.Multer.File,
  type: MediaType,
  duration?: number
): Promise<MediaResponse> => {
  const actorProfile = await prisma.actorProfile.findUnique({
    where: { userId }
  });

  if (!actorProfile) {
    throw new Error("Actor profile not found. Please create an actor profile before uploading portfolio media.");
  }

  // Enforce type-specific size and MIME limits
  if (type === "PHOTO") {
    if (!ALLOWED_PHOTO_MIMES.includes(file.mimetype as any)) {
      throw new Error(`Invalid image format (${file.mimetype}). Allowed formats: JPEG, PNG, WEBP.`);
    }
    if (file.size > MAX_PHOTO_SIZE) {
      throw new Error(`Photo file size exceeds maximum limit of 10MB (${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
    }
  } else if (type === "VIDEO") {
    if (!ALLOWED_VIDEO_MIMES.includes(file.mimetype as any)) {
      throw new Error(`Invalid video format (${file.mimetype}). Allowed formats: MP4, WEBM, QuickTime.`);
    }
    if (file.size > MAX_VIDEO_SIZE) {
      throw new Error(`Video file size exceeds maximum limit of 50MB (${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
    }
  }

  // Safe unique storage key
  const ext = path.extname(file.originalname).toLowerCase() || (type === "PHOTO" ? ".jpg" : ".mp4");
  const sanitizedOriginal = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, "_");
  const uniqueId = crypto.randomUUID();
  const storageKey = `actors/${actorProfile.id}/${type.toLowerCase()}_${Date.now()}_${uniqueId}${ext}`;

  // Upload to storage provider
  const storage = getStorageProvider();
  await storage.upload(storageKey, file.buffer, file.mimetype);

  // Record in PostgreSQL
  const media = await prisma.media.create({
    data: {
      actorId: actorProfile.id,
      type,
      storageKey,
      originalFileName: sanitizedOriginal,
      mimeType: file.mimetype,
      fileSize: file.size,
      duration: duration || null
    }
  });

  return toMediaResponse(media);
};

export const getActorMedia = async (
  actorId: string,
  type?: MediaType
): Promise<MediaResponse[]> => {
  const mediaList = await prisma.media.findMany({
    where: {
      actorId,
      ...(type && { type })
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return mediaList.map(toMediaResponse);
};

export const getMyMedia = async (
  userId: string,
  type?: MediaType
): Promise<MediaResponse[]> => {
  const actorProfile = await prisma.actorProfile.findUnique({
    where: { userId }
  });

  if (!actorProfile) {
    throw new Error("Actor profile not found");
  }

  return getActorMedia(actorProfile.id, type);
};

export const deleteMedia = async (
  userId: string,
  mediaId: string
): Promise<{ success: boolean; message: string }> => {
  const actorProfile = await prisma.actorProfile.findUnique({
    where: { userId }
  });

  if (!actorProfile) {
    throw new Error("Actor profile not found");
  }

  const media = await prisma.media.findUnique({
    where: { id: mediaId }
  });

  if (!media) {
    throw new Error("Media record not found");
  }

  if (media.actorId !== actorProfile.id) {
    throw new Error("Forbidden: This media record does not belong to you");
  }

  // Delete from object storage
  const storage = getStorageProvider();
  await storage.delete(media.storageKey);

  // Delete from database
  await prisma.media.delete({
    where: { id: mediaId }
  });

  return {
    success: true,
    message: "Media deleted successfully"
  };
};
