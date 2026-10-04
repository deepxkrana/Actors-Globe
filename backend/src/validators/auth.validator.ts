import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  phone: z.string().trim().regex(/^[0-9]{10}$/),
  password: z.string().min(8).max(100),
  role: z.enum(["ACTOR", "CASTER"])
});
export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(100)
});