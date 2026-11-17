import { z } from "zod";

export const createCastingRequestSchema = z.object({
  actorId: z.string().uuid("Invalid actor ID format"),
  castingRoleId: z.string().uuid("Invalid casting role ID format").optional()
});

export const updateCastingRequestStatusSchema = z.object({
  status: z.enum(["ACCEPTED", "REJECTED"], {
    error: "Status must be either ACCEPTED or REJECTED"
  })
});

export const castingRequestQuerySchema = z.object({
  status: z.enum(["PENDING", "ACCEPTED", "REJECTED"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10)
});
