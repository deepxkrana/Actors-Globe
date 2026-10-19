import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password cannot exceed 100 characters"),
  role: z.enum(["ACTOR", "CASTER"], {
    message: "Role must be either ACTOR or CASTER"
  })
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .max(100, "Password cannot exceed 100 characters")
});

export const verifyEmailSchema = z.object({
  code: z
    .string()
    .trim()
    .min(4, "Verification code is required")
    .max(12, "Invalid verification code length")
});

export const verifyPhoneSchema = z.object({
  code: z
    .string()
    .trim()
    .min(4, "Verification code is required")
    .max(12, "Invalid verification code length")
});

export const resendVerificationSchema = z.object({
  type: z.enum(["EMAIL", "PHONE"], {
    message: "Verification type must be either EMAIL or PHONE"
  })
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address")
});

export const resetPasswordSchema = z.object({
  token: z
    .string()
    .trim()
    .min(10, "Valid password reset token is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password cannot exceed 100 characters")
});