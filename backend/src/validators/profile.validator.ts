import { z } from "zod";

export const GENDERS = [
  "MALE",
  "FEMALE",
  "NON_BINARY",
  "OTHER",
  "PREFER_NOT_TO_SAY"
] as const;

export const SEXUAL_ORIENTATIONS = [
  "STRAIGHT",
  "GAY",
  "LESBIAN",
  "BISEXUAL",
  "PANSEXUAL",
  "ASEXUAL",
  "OTHER",
  "PREFER_NOT_TO_SAY"
] as const;

export const SKILLS = [
  "ACTING",
  "DANCING",
  "SINGING",
  "SWIMMING",
  "FIGHTING",
  "MARTIAL_ARTS",
  "HORSE_RIDING",
  "STUNT_PERFORMANCE",
  "GYMNASTICS",
  "CYCLING",
  "MODELING",
  "VOICE_ACTING",
  "COMEDY",
  "ACCENT_IMPERSONATION",
  "OTHER"
] as const;

export const createActorProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Display name must be at least 2 characters")
    .max(100, "Display name cannot exceed 100 characters"),
  dateOfBirth: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Date of birth must be a valid date string (e.g. YYYY-MM-DD)"
    })
    .refine(
      (val) => {
        const date = new Date(val);
        const now = new Date();
        const minAgeDate = new Date();
        minAgeDate.setFullYear(now.getFullYear() - 1);
        const maxAgeDate = new Date();
        maxAgeDate.setFullYear(now.getFullYear() - 120);
        return date <= minAgeDate && date >= maxAgeDate;
      },
      { message: "Date of birth must represent a valid age between 1 and 120 years" }
    ),
  gender: z.enum(GENDERS, {
    message: "Invalid gender value"
  }),
  sexualOrientation: z.enum(SEXUAL_ORIENTATIONS, {
    message: "Invalid sexual orientation value"
  }),
  bio: z.string().max(2000, "Bio cannot exceed 2000 characters").optional(),
  skills: z.array(z.enum(SKILLS, { message: "Invalid skill value" })).optional()
});

export const updateActorProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Display name must be at least 2 characters")
    .max(100, "Display name cannot exceed 100 characters")
    .optional(),
  dateOfBirth: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Date of birth must be a valid date string (e.g. YYYY-MM-DD)"
    })
    .refine(
      (val) => {
        const date = new Date(val);
        const now = new Date();
        const minAgeDate = new Date();
        minAgeDate.setFullYear(now.getFullYear() - 1);
        const maxAgeDate = new Date();
        maxAgeDate.setFullYear(now.getFullYear() - 120);
        return date <= minAgeDate && date >= maxAgeDate;
      },
      { message: "Date of birth must represent a valid age between 1 and 120 years" }
    )
    .optional(),
  gender: z.enum(GENDERS).optional(),
  sexualOrientation: z.enum(SEXUAL_ORIENTATIONS).optional(),
  bio: z.string().max(2000).optional(),
  skills: z.array(z.enum(SKILLS)).optional()
});

export const createCasterProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Display name must be at least 2 characters")
    .max(100, "Display name cannot exceed 100 characters"),
  bio: z.string().max(2000, "Bio cannot exceed 2000 characters").optional()
});

export const updateCasterProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Display name must be at least 2 characters")
    .max(100, "Display name cannot exceed 100 characters")
    .optional(),
  bio: z.string().max(2000).optional()
});

export const createExperienceSchema = z.object({
  roleTitle: z
    .string()
    .trim()
    .min(2, "Role title must be at least 2 characters")
    .max(150, "Role title cannot exceed 150 characters"),
  organization: z.string().trim().max(150).optional(),
  description: z.string().max(2000).optional(),
  startDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Start date must be a valid date")
    .optional(),
  endDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "End date must be a valid date")
    .optional(),
  isCurrent: z.boolean().optional()
});

export const updateExperienceSchema = z.object({
  roleTitle: z.string().trim().min(2).max(150).optional(),
  organization: z.string().trim().max(150).optional(),
  description: z.string().max(2000).optional(),
  startDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Start date must be a valid date")
    .optional(),
  endDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "End date must be a valid date")
    .optional(),
  isCurrent: z.boolean().optional()
});
