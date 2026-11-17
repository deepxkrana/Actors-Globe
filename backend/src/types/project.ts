export const PROJECT_TYPES = [
  "FEATURE_FILM",
  "SHORT_FILM",
  "WEB_SERIES",
  "TV_SERIES",
  "ADVERTISEMENT",
  "MUSIC_VIDEO",
  "THEATRE",
  "OTHER"
] as const;

export const GENDER_REQUIREMENTS = [
  "MALE",
  "FEMALE",
  "NON_BINARY",
  "OTHER",
  "ANY"
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];
export type GenderRequirement = (typeof GENDER_REQUIREMENTS)[number];
export type ProjectStatus = "DRAFT" | "PUBLISHED" | "CLOSED";
export type CastingRoleStatus = "OPEN" | "CLOSED";

export type CreateCastingRoleInput = {
  title: string;
  description: string;
  genderRequirement?: GenderRequirement;
  minAge?: number;
  maxAge?: number;
};

export type UpdateCastingRoleInput = {
  title?: string;
  description?: string;
  genderRequirement?: GenderRequirement;
  minAge?: number;
  maxAge?: number;
  status?: CastingRoleStatus;
};

export type CreateProjectInput = {
  title: string;
  description: string;
  projectType: ProjectType;
  location: string;
  startDate?: string;
  endDate?: string;
  applicationDeadline?: string;
  roles?: CreateCastingRoleInput[];
};

export type UpdateProjectInput = {
  title?: string;
  description?: string;
  projectType?: ProjectType;
  location?: string;
  startDate?: string;
  endDate?: string;
  applicationDeadline?: string;
};
