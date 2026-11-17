import type { Gender, Skill, PublicActorProfile } from "./profile.js";
import type { ProjectType, GenderRequirement } from "./project.js";

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type PaginatedResult<T> = {
  items: T[];
  pagination: PaginationMeta;
};

export type SearchActorsInput = {
  q?: string;
  skills?: Skill[];
  skillMatch?: "all" | "any";
  gender?: Gender;
  minAge?: number;
  maxAge?: number;
  hasExperience?: boolean;
  experienceKeyword?: string;
  hasMedia?: boolean;
  sortBy?: "createdAt" | "displayName" | "age";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
};

export type SearchProjectsInput = {
  q?: string;
  projectType?: ProjectType;
  location?: string;
  hasOpenRoles?: boolean;
  deadlineBefore?: string;
  deadlineAfter?: string;
  sortBy?: "createdAt" | "applicationDeadline" | "title";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
};

export type SearchRolesInput = {
  q?: string;
  genderRequirement?: GenderRequirement;
  age?: number;
  minAge?: number;
  maxAge?: number;
  projectType?: ProjectType;
  location?: string;
  status?: "OPEN" | "CLOSED";
  sortBy?: "createdAt" | "title" | "minAge" | "maxAge";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
};

export type SearchActorResultItem = PublicActorProfile & {
  mediaCount: number;
  experienceCount: number;
  media: Array<{
    id: string;
    type: "PHOTO" | "VIDEO";
    storageKey: string;
    url: string;
    originalFileName: string;
    mimeType: string;
    fileSize: number;
  }>;
};

export type SearchProjectResultItem = {
  id: string;
  title: string;
  description: string;
  projectType: ProjectType;
  location: string;
  startDate: Date | null;
  endDate: Date | null;
  applicationDeadline: Date | null;
  status: "PUBLISHED";
  createdAt: Date;
  updatedAt: Date;
  caster: {
    id: string;
    displayName: string;
    bio: string | null;
  };
  castingRoles: Array<{
    id: string;
    title: string;
    description: string;
    genderRequirement: GenderRequirement;
    minAge: number | null;
    maxAge: number | null;
    status: "OPEN" | "CLOSED";
    createdAt: Date;
  }>;
  openRolesCount: number;
};

export type SearchRoleResultItem = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  genderRequirement: GenderRequirement;
  minAge: number | null;
  maxAge: number | null;
  status: "OPEN" | "CLOSED";
  createdAt: Date;
  updatedAt: Date;
  project: {
    id: string;
    title: string;
    projectType: ProjectType;
    location: string;
    applicationDeadline: Date | null;
    status: "PUBLISHED";
    caster: {
      id: string;
      displayName: string;
    };
  };
};
