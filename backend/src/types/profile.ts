import type { GENDERS, SEXUAL_ORIENTATIONS, SKILLS } from "../validators/profile.validator.js";

export type Gender = (typeof GENDERS)[number];
export type SexualOrientation = (typeof SEXUAL_ORIENTATIONS)[number];
export type Skill = (typeof SKILLS)[number];

export type CreateActorProfileInput = {
  displayName: string;
  dateOfBirth: string; // ISO date string
  gender: Gender;
  sexualOrientation: SexualOrientation;
  bio?: string;
  skills?: Skill[];
};

export type UpdateActorProfileInput = {
  displayName?: string;
  dateOfBirth?: string;
  gender?: Gender;
  sexualOrientation?: SexualOrientation;
  bio?: string;
  skills?: Skill[];
};

export type CreateCasterProfileInput = {
  displayName: string;
  bio?: string;
};

export type UpdateCasterProfileInput = {
  displayName?: string;
  bio?: string;
};

export type CreateExperienceInput = {
  roleTitle: string;
  organization?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
};

export type UpdateExperienceInput = {
  roleTitle?: string;
  organization?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
};

export type PublicActorProfile = {
  id: string;
  displayName: string;
  age: number;
  gender: Gender;
  bio: string | null;
  skills: Skill[];
  experiences: Array<{
    id: string;
    roleTitle: string;
    organization: string | null;
    description: string | null;
    startDate: Date | null;
    endDate: Date | null;
    isCurrent: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
};
