import { z } from "zod";
import { PROJECT_TYPES, GENDER_REQUIREMENTS } from "../types/project.js";

export const createCastingRoleSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, "Role title must be at least 2 characters")
      .max(150, "Role title cannot exceed 150 characters"),
    description: z
      .string()
      .trim()
      .min(5, "Role description must be at least 5 characters")
      .max(3000, "Role description cannot exceed 3000 characters"),
    genderRequirement: z.enum(GENDER_REQUIREMENTS).optional(),
    minAge: z.coerce.number().int().min(0).max(120).optional(),
    maxAge: z.coerce.number().int().min(0).max(120).optional()
  })
  .refine(
    (data) => {
      if (data.minAge !== undefined && data.maxAge !== undefined) {
        return data.minAge <= data.maxAge;
      }
      return true;
    },
    { message: "Minimum age cannot be greater than maximum age", path: ["minAge"] }
  );

export const updateCastingRoleSchema = z
  .object({
    title: z.string().trim().min(2).max(150).optional(),
    description: z.string().trim().min(5).max(3000).optional(),
    genderRequirement: z.enum(GENDER_REQUIREMENTS).optional(),
    minAge: z.coerce.number().int().min(0).max(120).optional(),
    maxAge: z.coerce.number().int().min(0).max(120).optional(),
    status: z.enum(["OPEN", "CLOSED"]).optional()
  })
  .refine(
    (data) => {
      if (data.minAge !== undefined && data.maxAge !== undefined) {
        return data.minAge <= data.maxAge;
      }
      return true;
    },
    { message: "Minimum age cannot be greater than maximum age", path: ["minAge"] }
  );

export const createProjectSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Project title must be at least 2 characters")
    .max(200, "Project title cannot exceed 200 characters"),
  description: z
    .string()
    .trim()
    .min(10, "Project description must be at least 10 characters")
    .max(5000, "Project description cannot exceed 5000 characters"),
  projectType: z.enum(PROJECT_TYPES, {
    message: "Invalid project type"
  }),
  location: z
    .string()
    .trim()
    .min(2, "Location must be at least 2 characters")
    .max(200, "Location cannot exceed 200 characters"),
  startDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Start date must be a valid date")
    .optional(),
  endDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "End date must be a valid date")
    .optional(),
  applicationDeadline: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Application deadline must be a valid date")
    .optional(),
  roles: z.array(createCastingRoleSchema).optional()
});

export const updateProjectSchema = z.object({
  title: z.string().trim().min(2).max(200).optional(),
  description: z.string().trim().min(10).max(5000).optional(),
  projectType: z.enum(PROJECT_TYPES).optional(),
  location: z.string().trim().min(2).max(200).optional(),
  startDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Start date must be a valid date")
    .optional(),
  endDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "End date must be a valid date")
    .optional(),
  applicationDeadline: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Application deadline must be a valid date")
    .optional()
});
