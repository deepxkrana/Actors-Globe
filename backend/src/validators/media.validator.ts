import { z } from "zod";

export const ALLOWED_PHOTO_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp"
] as const;

export const ALLOWED_VIDEO_MIMES = [
  "video/mp4",
  "video/webm",
  "video/quicktime"
] as const;

export const MAX_PHOTO_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

export const mediaQuerySchema = z.object({
  type: z.enum(["PHOTO", "VIDEO"]).optional()
});

export const uploadMediaBodySchema = z.object({
  type: z.enum(["PHOTO", "VIDEO"], {
    message: "Media type must be PHOTO or VIDEO"
  }),
  duration: z.coerce.number().int().positive().optional()
});
