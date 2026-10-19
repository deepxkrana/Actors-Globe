import prisma from "../config/prisma.js";
import { getStorageProvider } from "../utils/storage.js";
import { calculateAge } from "./profile.service.js";
import { SKILLS, GENDERS } from "../validators/profile.validator.js";
import { PROJECT_TYPES, GENDER_REQUIREMENTS } from "../types/project.js";
import type {
  SearchActorsInput,
  SearchProjectsInput,
  SearchRolesInput,
  PaginatedResult,
  SearchActorResultItem,
  SearchProjectResultItem,
  SearchRoleResultItem
} from "../types/search.js";

export const searchActors = async (
  filters: SearchActorsInput
): Promise<PaginatedResult<SearchActorResultItem>> => {
  const where: any = {
    user: {
      isActive: true
    }
  };

  if (filters.q) {
    const query = filters.q.trim();
    where.OR = [
      { displayName: { contains: query, mode: "insensitive" } },
      { bio: { contains: query, mode: "insensitive" } }
    ];
  }

  if (filters.gender) {
    where.gender = filters.gender;
  }

  if (filters.skills && filters.skills.length > 0) {
    if (filters.skillMatch === "any") {
      where.skills = { hasSome: filters.skills };
    } else {
      where.skills = { hasEvery: filters.skills };
    }
  }

  if (filters.minAge !== undefined || filters.maxAge !== undefined) {
    const now = new Date();
    const dobFilter: any = {};

    if (filters.minAge !== undefined) {
      // Must be at least minAge -> born on or before (now.year - minAge)
      dobFilter.lte = new Date(
        now.getFullYear() - filters.minAge,
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999
      );
    }

    if (filters.maxAge !== undefined) {
      // Must be at most maxAge -> born on or after (now.year - (maxAge + 1))
      dobFilter.gte = new Date(
        now.getFullYear() - (filters.maxAge + 1),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0,
        0
      );
    }

    where.dateOfBirth = dobFilter;
  }

  if (filters.hasExperience !== undefined) {
    if (filters.hasExperience) {
      where.experiences = { some: {} };
    } else {
      where.experiences = { none: {} };
    }
  }

  if (filters.experienceKeyword) {
    const kw = filters.experienceKeyword.trim();
    where.experiences = {
      ...where.experiences,
      some: {
        OR: [
          { roleTitle: { contains: kw, mode: "insensitive" } },
          { organization: { contains: kw, mode: "insensitive" } },
          { description: { contains: kw, mode: "insensitive" } }
        ]
      }
    };
  }

  if (filters.hasMedia !== undefined) {
    if (filters.hasMedia) {
      where.media = { some: {} };
    } else {
      where.media = { none: {} };
    }
  }

  const sortOrder = filters.sortOrder || "desc";
  let orderBy: any[];

  if (filters.sortBy === "displayName") {
    orderBy = [{ displayName: sortOrder }, { id: "asc" }];
  } else if (filters.sortBy === "age") {
    // Younger actor has higher DOB, older actor has lower DOB
    orderBy = [
      { dateOfBirth: sortOrder === "asc" ? "desc" : "asc" },
      { id: "asc" }
    ];
  } else {
    orderBy = [{ createdAt: sortOrder }, { id: "asc" }];
  }

  const page = Math.max(1, filters.page || 1);
  const limit = Math.min(50, Math.max(1, filters.limit || 10));
  const skip = (page - 1) * limit;

  const [total, actors] = await Promise.all([
    prisma.actorProfile.count({ where }),
    prisma.actorProfile.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        experiences: {
          orderBy: { startDate: "desc" }
        },
        media: {
          orderBy: { createdAt: "desc" }
        }
      }
    })
  ]);

  const storage = getStorageProvider();

  const items: SearchActorResultItem[] = actors.map((actor: any) => ({
    id: actor.id,
    displayName: actor.displayName,
    age: calculateAge(actor.dateOfBirth),
    gender: actor.gender,
    bio: actor.bio,
    skills: actor.skills,
    experiences: actor.experiences.map((exp: any) => ({
      id: exp.id,
      roleTitle: exp.roleTitle,
      organization: exp.organization,
      description: exp.description,
      startDate: exp.startDate,
      endDate: exp.endDate,
      isCurrent: exp.isCurrent
    })),
    experienceCount: actor.experiences.length,
    media: actor.media.map((m: any) => ({
      id: m.id,
      type: m.type,
      storageKey: m.storageKey,
      url: storage.getUrl(m.storageKey),
      originalFileName: m.originalFileName,
      mimeType: m.mimeType,
      fileSize: m.fileSize
    })),
    mediaCount: actor.media.length,
    createdAt: actor.createdAt,
    updatedAt: actor.updatedAt
    // PRIVACY ENFORCEMENT: sexualOrientation and exact dateOfBirth are STRICTLY omitted!
  }));

  const totalPages = Math.ceil(total / limit);

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};

export const searchProjects = async (
  filters: SearchProjectsInput
): Promise<PaginatedResult<SearchProjectResultItem>> => {
  const where: any = {
    status: "PUBLISHED"
  };

  if (filters.q) {
    const query = filters.q.trim();
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } }
    ];
  }

  if (filters.projectType) {
    where.projectType = filters.projectType;
  }

  if (filters.location) {
    where.location = { contains: filters.location.trim(), mode: "insensitive" };
  }

  if (filters.hasOpenRoles !== undefined && filters.hasOpenRoles) {
    where.castingRoles = { some: { status: "OPEN" } };
  }

  if (filters.deadlineBefore || filters.deadlineAfter) {
    const deadlineFilter: any = {};
    if (filters.deadlineBefore) {
      deadlineFilter.lte = new Date(filters.deadlineBefore);
    }
    if (filters.deadlineAfter) {
      deadlineFilter.gte = new Date(filters.deadlineAfter);
    }
    where.applicationDeadline = deadlineFilter;
  }

  const sortOrder = filters.sortOrder || "desc";
  let orderBy: any[];

  if (filters.sortBy === "applicationDeadline") {
    orderBy = [{ applicationDeadline: sortOrder }, { id: "asc" }];
  } else if (filters.sortBy === "title") {
    orderBy = [{ title: sortOrder }, { id: "asc" }];
  } else {
    orderBy = [{ createdAt: sortOrder }, { id: "asc" }];
  }

  const page = Math.max(1, filters.page || 1);
  const limit = Math.min(50, Math.max(1, filters.limit || 10));
  const skip = (page - 1) * limit;

  const [total, projects] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        caster: {
          select: {
            id: true,
            displayName: true,
            bio: true
          }
        },
        castingRoles: {
          where: { status: "OPEN" },
          orderBy: { createdAt: "asc" }
        }
      }
    })
  ]);

  const items: SearchProjectResultItem[] = projects.map((project: any) => ({
    id: project.id,
    title: project.title,
    description: project.description,
    projectType: project.projectType,
    location: project.location,
    startDate: project.startDate,
    endDate: project.endDate,
    applicationDeadline: project.applicationDeadline,
    status: project.status,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    caster: project.caster,
    castingRoles: project.castingRoles.map((role: any) => ({
      id: role.id,
      title: role.title,
      description: role.description,
      genderRequirement: role.genderRequirement,
      minAge: role.minAge,
      maxAge: role.maxAge,
      status: role.status,
      createdAt: role.createdAt
    })),
    openRolesCount: project.castingRoles.length
  }));

  const totalPages = Math.ceil(total / limit);

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};

export const searchRoles = async (
  filters: SearchRolesInput
): Promise<PaginatedResult<SearchRoleResultItem>> => {
  const where: any = {
    status: filters.status || "OPEN",
    project: {
      status: "PUBLISHED"
    }
  };

  if (filters.q) {
    const query = filters.q.trim();
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { project: { title: { contains: query, mode: "insensitive" } } }
    ];
  }

  if (filters.genderRequirement) {
    if (filters.genderRequirement === "ANY") {
      where.genderRequirement = "ANY";
    } else {
      where.genderRequirement = {
        in: [filters.genderRequirement, "ANY"]
      };
    }
  }

  if (filters.age !== undefined) {
    // Matches roles suitable for an actor of this age: (minAge is null or minAge <= age) and (maxAge is null or maxAge >= age)
    where.AND = [
      {
        OR: [{ minAge: null }, { minAge: { lte: filters.age } }]
      },
      {
        OR: [{ maxAge: null }, { maxAge: { gte: filters.age } }]
      }
    ];
  }

  if (filters.minAge !== undefined) {
    where.minAge = { gte: filters.minAge };
  }

  if (filters.maxAge !== undefined) {
    where.maxAge = { lte: filters.maxAge };
  }

  if (filters.projectType) {
    where.project = {
      ...where.project,
      projectType: filters.projectType
    };
  }

  if (filters.location) {
    where.project = {
      ...where.project,
      location: { contains: filters.location.trim(), mode: "insensitive" }
    };
  }

  const sortOrder = filters.sortOrder || "desc";
  let orderBy: any[];

  if (filters.sortBy === "title") {
    orderBy = [{ title: sortOrder }, { id: "asc" }];
  } else if (filters.sortBy === "minAge") {
    orderBy = [{ minAge: sortOrder }, { id: "asc" }];
  } else if (filters.sortBy === "maxAge") {
    orderBy = [{ maxAge: sortOrder }, { id: "asc" }];
  } else {
    orderBy = [{ createdAt: sortOrder }, { id: "asc" }];
  }

  const page = Math.max(1, filters.page || 1);
  const limit = Math.min(50, Math.max(1, filters.limit || 10));
  const skip = (page - 1) * limit;

  const [total, roles] = await Promise.all([
    prisma.castingRole.count({ where }),
    prisma.castingRole.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        project: {
          select: {
            id: true,
            title: true,
            projectType: true,
            location: true,
            applicationDeadline: true,
            status: true,
            caster: {
              select: {
                id: true,
                displayName: true
              }
            }
          }
        }
      }
    })
  ]);

  const items: SearchRoleResultItem[] = roles.map((role: any) => ({
    id: role.id,
    projectId: role.projectId,
    title: role.title,
    description: role.description,
    genderRequirement: role.genderRequirement,
    minAge: role.minAge,
    maxAge: role.maxAge,
    status: role.status,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
    project: role.project
  }));

  const totalPages = Math.ceil(total / limit);

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};

export const getSearchFilterMetadata = () => {
  return {
    skills: SKILLS,
    genders: GENDERS,
    projectTypes: PROJECT_TYPES,
    genderRequirements: GENDER_REQUIREMENTS,
    sortOptions: {
      actors: ["createdAt", "displayName", "age"],
      projects: ["createdAt", "applicationDeadline", "title"],
      roles: ["createdAt", "title", "minAge", "maxAge"]
    }
  };
};
