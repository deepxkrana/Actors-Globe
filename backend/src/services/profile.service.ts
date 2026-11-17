import prisma from "../config/prisma.js";
import type {
  CreateActorProfileInput,
  UpdateActorProfileInput,
  CreateCasterProfileInput,
  UpdateCasterProfileInput,
  CreateExperienceInput,
  UpdateExperienceInput,
  PublicActorProfile
} from "../types/profile.js";

export const calculateAge = (dateOfBirth: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const m = today.getMonth() - dateOfBirth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  return age;
};

export const toPublicActorProfile = (profile: any): PublicActorProfile => {
  return {
    id: profile.id,
    displayName: profile.displayName,
    age: calculateAge(new Date(profile.dateOfBirth)),
    gender: profile.gender,
    bio: profile.bio,
    skills: profile.skills || [],
    experiences: (profile.experiences || []).map((exp: any) => ({
      id: exp.id,
      roleTitle: exp.roleTitle,
      organization: exp.organization,
      description: exp.description,
      startDate: exp.startDate,
      endDate: exp.endDate,
      isCurrent: exp.isCurrent
    })),
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt
    // Note: sexualOrientation and exact dateOfBirth are strictly excluded for privacy!
  };
};

// -------------------------------------------------------------
// Actor Profile Operations
// -------------------------------------------------------------

export const createActorProfile = async (
  userId: string,
  data: CreateActorProfileInput
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error("User account not found");
  }

  if (user.role !== "ACTOR") {
    throw new Error("Forbidden: Only users with the ACTOR role can create an actor profile");
  }

  const existingProfile = await prisma.actorProfile.findUnique({
    where: { userId }
  });

  if (existingProfile) {
    throw new Error("Actor profile already exists for this account");
  }

  const profile = await prisma.actorProfile.create({
    data: {
      userId,
      displayName: data.displayName.trim(),
      dateOfBirth: new Date(data.dateOfBirth),
      gender: data.gender,
      sexualOrientation: data.sexualOrientation,
      bio: data.bio?.trim() || null,
      skills: data.skills || []
    },
    include: {
      experiences: {
        orderBy: { startDate: "desc" }
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          emailVerified: true,
          phoneVerified: true
        }
      }
    }
  });

  return profile;
};

export const getActorProfileByUserId = async (userId: string) => {
  const profile = await prisma.actorProfile.findUnique({
    where: { userId },
    include: {
      experiences: {
        orderBy: { startDate: "desc" }
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          emailVerified: true,
          phoneVerified: true
        }
      }
    }
  });

  return profile;
};

export const getPublicActorProfileById = async (id: string): Promise<PublicActorProfile | null> => {
  const profile = await prisma.actorProfile.findUnique({
    where: { id },
    include: {
      experiences: {
        orderBy: { startDate: "desc" }
      }
    }
  });

  if (!profile) {
    return null;
  }

  return toPublicActorProfile(profile);
};

export const updateActorProfile = async (
  userId: string,
  data: UpdateActorProfileInput
) => {
  const existingProfile = await prisma.actorProfile.findUnique({
    where: { userId }
  });

  if (!existingProfile) {
    throw new Error("Actor profile not found. Please create one first.");
  }

  const updatedProfile = await prisma.actorProfile.update({
    where: { userId },
    data: {
      ...(data.displayName !== undefined && { displayName: data.displayName.trim() }),
      ...(data.dateOfBirth !== undefined && { dateOfBirth: new Date(data.dateOfBirth) }),
      ...(data.gender !== undefined && { gender: data.gender }),
      ...(data.sexualOrientation !== undefined && { sexualOrientation: data.sexualOrientation }),
      ...(data.bio !== undefined && { bio: data.bio.trim() || null }),
      ...(data.skills !== undefined && { skills: data.skills })
    },
    include: {
      experiences: {
        orderBy: { startDate: "desc" }
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          emailVerified: true,
          phoneVerified: true
        }
      }
    }
  });

  return updatedProfile;
};

// -------------------------------------------------------------
// Caster Profile Operations
// -------------------------------------------------------------

export const createCasterProfile = async (
  userId: string,
  data: CreateCasterProfileInput
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error("User account not found");
  }

  if (user.role !== "CASTER") {
    throw new Error("Forbidden: Only users with the CASTER role can create a caster profile");
  }

  const existingProfile = await prisma.casterProfile.findUnique({
    where: { userId }
  });

  if (existingProfile) {
    throw new Error("Caster profile already exists for this account");
  }

  const profile = await prisma.casterProfile.create({
    data: {
      userId,
      displayName: data.displayName.trim(),
      bio: data.bio?.trim() || null
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          emailVerified: true,
          phoneVerified: true
        }
      }
    }
  });

  return profile;
};

export const getCasterProfileByUserId = async (userId: string) => {
  const profile = await prisma.casterProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          emailVerified: true,
          phoneVerified: true
        }
      }
    }
  });

  return profile;
};

export const getPublicCasterProfileById = async (id: string) => {
  const profile = await prisma.casterProfile.findUnique({
    where: { id }
  });

  if (!profile) {
    return null;
  }

  return {
    id: profile.id,
    displayName: profile.displayName,
    bio: profile.bio,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt
  };
};

export const updateCasterProfile = async (
  userId: string,
  data: UpdateCasterProfileInput
) => {
  const existingProfile = await prisma.casterProfile.findUnique({
    where: { userId }
  });

  if (!existingProfile) {
    throw new Error("Caster profile not found. Please create one first.");
  }

  const updatedProfile = await prisma.casterProfile.update({
    where: { userId },
    data: {
      ...(data.displayName !== undefined && { displayName: data.displayName.trim() }),
      ...(data.bio !== undefined && { bio: data.bio.trim() || null })
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          emailVerified: true,
          phoneVerified: true
        }
      }
    }
  });

  return updatedProfile;
};

// -------------------------------------------------------------
// Experience Operations (Actor Sub-Resource)
// -------------------------------------------------------------

export const addExperience = async (
  userId: string,
  data: CreateExperienceInput
) => {
  const actorProfile = await prisma.actorProfile.findUnique({
    where: { userId }
  });

  if (!actorProfile) {
    throw new Error("Actor profile not found. Please create a profile first.");
  }

  const experience = await prisma.experience.create({
    data: {
      actorId: actorProfile.id,
      roleTitle: data.roleTitle.trim(),
      organization: data.organization?.trim() || null,
      description: data.description?.trim() || null,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      isCurrent: data.isCurrent || false
    }
  });

  return experience;
};

export const getExperiencesByUserId = async (userId: string) => {
  const actorProfile = await prisma.actorProfile.findUnique({
    where: { userId }
  });

  if (!actorProfile) {
    throw new Error("Actor profile not found");
  }

  const experiences = await prisma.experience.findMany({
    where: { actorId: actorProfile.id },
    orderBy: { startDate: "desc" }
  });

  return experiences;
};

export const updateExperience = async (
  userId: string,
  experienceId: string,
  data: UpdateExperienceInput
) => {
  const actorProfile = await prisma.actorProfile.findUnique({
    where: { userId }
  });

  if (!actorProfile) {
    throw new Error("Actor profile not found");
  }

  const existingExperience = await prisma.experience.findUnique({
    where: { id: experienceId }
  });

  if (!existingExperience) {
    throw new Error("Experience record not found");
  }

  if (existingExperience.actorId !== actorProfile.id) {
    throw new Error("Forbidden: This experience record does not belong to you");
  }

  const updatedExperience = await prisma.experience.update({
    where: { id: experienceId },
    data: {
      ...(data.roleTitle !== undefined && { roleTitle: data.roleTitle.trim() }),
      ...(data.organization !== undefined && { organization: data.organization.trim() || null }),
      ...(data.description !== undefined && { description: data.description.trim() || null }),
      ...(data.startDate !== undefined && { startDate: data.startDate ? new Date(data.startDate) : null }),
      ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
      ...(data.isCurrent !== undefined && { isCurrent: data.isCurrent })
    }
  });

  return updatedExperience;
};

export const deleteExperience = async (
  userId: string,
  experienceId: string
) => {
  const actorProfile = await prisma.actorProfile.findUnique({
    where: { userId }
  });

  if (!actorProfile) {
    throw new Error("Actor profile not found");
  }

  const existingExperience = await prisma.experience.findUnique({
    where: { id: experienceId }
  });

  if (!existingExperience) {
    throw new Error("Experience record not found");
  }

  if (existingExperience.actorId !== actorProfile.id) {
    throw new Error("Forbidden: This experience record does not belong to you");
  }

  await prisma.experience.delete({
    where: { id: experienceId }
  });

  return { success: true };
};
