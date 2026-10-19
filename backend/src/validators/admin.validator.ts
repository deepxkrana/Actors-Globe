import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});

export const updateReportStatusSchema = z.object({
  status: z.enum(["UNDER_REVIEW", "RESOLVED", "DISMISSED"], {
    message: "Status must be UNDER_REVIEW, RESOLVED, or DISMISSED"
  }),
  resolutionNote: z.string().trim().max(1000, "Resolution note cannot exceed 1000 characters").optional()
});

export const reportFilterQuerySchema = z.object({
  status: z.enum(["PENDING", "UNDER_REVIEW", "RESOLVED", "DISMISSED"]).optional(),
  targetType: z.enum(["USER", "PROFILE", "PROJECT", "CASTING_ROLE", "MEDIA", "MESSAGE"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20)
});

export const userModerationSchema = z.object({
  isActive: z.boolean({
    message: "isActive boolean is required"
  }),
  reason: z.string().trim().min(3, "Reason must be at least 3 characters").max(500)
});
