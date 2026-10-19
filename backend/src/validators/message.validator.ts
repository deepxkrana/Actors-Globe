import { z } from "zod";

export const createConversationSchema = z
  .object({
    actorId: z.string().uuid("Invalid actor ID format").optional(),
    casterId: z.string().uuid("Invalid caster ID format").optional(),
    recipientUserId: z.string().uuid("Invalid recipient user ID format").optional()
  })
  .refine(
    (data) => Boolean(data.actorId || data.casterId || data.recipientUserId),
    {
      message: "Must provide either actorId, casterId, or recipientUserId",
      path: ["recipientUserId"]
    }
  );

export const sendMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Message content cannot be empty")
    .max(2000, "Message content cannot exceed 2000 characters"),
  type: z.enum(["TEXT", "SYSTEM"]).default("TEXT")
});

export const messageQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  before: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date format")
    .optional()
});

export const conversationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10)
});
