import { z } from "zod";
import { GENDERS, SKILLS } from "./profile.validator.js";
import { PROJECT_TYPES, GENDER_REQUIREMENTS } from "../types/project.js";

const booleanQuery = z.preprocess((val) => {
  if (typeof val === "string") {
    const lower = val.trim().toLowerCase();
    if (lower === "true" || lower === "1") return true;
    if (lower === "false" || lower === "0") return false;
    return undefined;
  }
  if (typeof val === "boolean") return val;
  return undefined;
}, z.boolean().optional());

const skillsQuery = z.preprocess((val) => {
  if (typeof val === "string") {
    if (!val.trim()) return undefined;
    return val
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);
  }
  if (Array.isArray(val)) {
    return val.map((s) => String(s).trim().toUpperCase()).filter(Boolean);
  }
  return val;
}, z.array(z.enum(SKILLS)).optional());

export const searchActorsSchema = z
  .object({
    q: z.string().trim().max(100).optional(),
    skills: skillsQuery,
    skillMatch: z.enum(["all", "any"]).default("all"),
    gender: z.enum(GENDERS).optional(),
    minAge: z.coerce.number().int().min(1).max(120).optional(),
    maxAge: z.coerce.number().int().min(1).max(120).optional(),
    hasExperience: booleanQuery,
    experienceKeyword: z.string().trim().max(100).optional(),
    hasMedia: booleanQuery,
    sortBy: z.enum(["createdAt", "displayName", "age"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10)
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

export const searchProjectsSchema = z.object({
  q: z.string().trim().max(100).optional(),
  projectType: z.enum(PROJECT_TYPES).optional(),
  location: z.string().trim().max(100).optional(),
  hasOpenRoles: booleanQuery,
  deadlineBefore: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Invalid deadlineBefore date")
    .optional(),
  deadlineAfter: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Invalid deadlineAfter date")
    .optional(),
  sortBy: z.enum(["createdAt", "applicationDeadline", "title"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10)
});

export const searchRolesSchema = z
  .object({
    q: z.string().trim().max(100).optional(),
    genderRequirement: z.enum(GENDER_REQUIREMENTS).optional(),
    age: z.coerce.number().int().min(1).max(120).optional(),
    minAge: z.coerce.number().int().min(0).max(120).optional(),
    maxAge: z.coerce.number().int().min(0).max(120).optional(),
    projectType: z.enum(PROJECT_TYPES).optional(),
    location: z.string().trim().max(100).optional(),
    status: z.enum(["OPEN", "CLOSED"]).default("OPEN"),
    sortBy: z.enum(["createdAt", "title", "minAge", "maxAge"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10)
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
