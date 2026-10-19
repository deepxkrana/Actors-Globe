import { z } from "zod";

export const applyToRoleSchema = z.object({
  castingRoleId: z.string().uuid("Invalid casting role ID format")
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(["ACCEPTED", "REJECTED"], {
    error: "Status must be either ACCEPTED or REJECTED"
  })
});

export const applicationQuerySchema = z.object({
  status: z.enum(["PENDING", "ACCEPTED", "REJECTED"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10)
});
