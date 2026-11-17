import { z } from "zod";

export const createReportSchema = z.object({
  targetType: z.enum(["USER", "PROFILE", "PROJECT", "CASTING_ROLE", "MEDIA", "MESSAGE"], {
    message: "Invalid targetType"
  }),
  targetId: z.string().trim().min(1, "Target ID is required"),
  reason: z
    .string()
    .trim()
    .min(3, "Reason must be at least 3 characters")
    .max(200, "Reason cannot exceed 200 characters"),
  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional(),
  reportedUserId: z.string().trim().optional()
});

export const myReportsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20)
});
