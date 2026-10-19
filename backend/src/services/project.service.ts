import prisma from "../config/prisma.js";
import { isCasterPremium } from "./subscription.service.js";
import type {
  CreateProjectInput,
  UpdateProjectInput,
  CreateCastingRoleInput,
  UpdateCastingRoleInput
} from "../types/project.js";

export const createProject = async (
  userId: string,
  data: CreateProjectInput
) => {
  const casterProfile = await prisma.casterProfile.findUnique({
    where: { userId }
  });

  if (!casterProfile) {
    throw new Error("Caster profile not found. Please create a caster profile first.");
  }

  // Premium caster entitlement check
  const hasPremium = await isCasterPremium(userId);
  if (!hasPremium) {
    throw new Error("Upgrade required: Only premium casters can create projects. Please upgrade your subscription to access this feature.");
  }

  // Atomic transaction to create project and initial roles (if provided)
  const project = await prisma.$transaction(async (tx: any) => {
    const createdProject = await tx.project.create({
      data: {
        casterId: casterProfile.id,
        title: data.title.trim(),
        description: data.description.trim(),
        projectType: data.projectType,
        location: data.location.trim(),
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline) : null,
        status: "DRAFT"
      }
    });

    if (data.roles && data.roles.length > 0) {
      await tx.castingRole.createMany({
        data: data.roles.map((role) => ({
          projectId: createdProject.id,
          title: role.title.trim(),
          description: role.description.trim(),
          genderRequirement: role.genderRequirement || "ANY",
          minAge: role.minAge || null,
          maxAge: role.maxAge || null,
          status: "OPEN"
        }))
      });
    }

    return tx.project.findUnique({
      where: { id: createdProject.id },
      include: {
        castingRoles: true,
        caster: {
          select: {
            id: true,
            displayName: true,
            bio: true
          }
        }
      }
    });
  });

  return project;
};

export const addCastingRole = async (
  userId: string,
  projectId: string,
  data: CreateCastingRoleInput
) => {
  const casterProfile = await prisma.casterProfile.findUnique({
    where: { userId }
  });

  if (!casterProfile) {
    throw new Error("Caster profile not found");
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.casterId !== casterProfile.id) {
    throw new Error("Forbidden: You do not have permission to manage this project");
  }

  if (project.status === "CLOSED") {
    throw new Error("Cannot add casting roles to a closed project");
  }

  const role = await prisma.castingRole.create({
    data: {
      projectId,
      title: data.title.trim(),
      description: data.description.trim(),
      genderRequirement: data.genderRequirement || "ANY",
      minAge: data.minAge || null,
      maxAge: data.maxAge || null,
      status: "OPEN"
    }
  });

  return role;
};

export const updateCastingRole = async (
  userId: string,
  projectId: string,
  roleId: string,
  data: UpdateCastingRoleInput
) => {
  const casterProfile = await prisma.casterProfile.findUnique({
    where: { userId }
  });

  if (!casterProfile) {
    throw new Error("Caster profile not found");
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.casterId !== casterProfile.id) {
    throw new Error("Forbidden: You do not have permission to manage this project");
  }

  const existingRole = await prisma.castingRole.findFirst({
    where: { id: roleId, projectId }
  });

  if (!existingRole) {
    throw new Error("Casting role not found in this project");
  }

  const updatedRole = await prisma.castingRole.update({
    where: { id: roleId },
    data: {
      ...(data.title !== undefined && { title: data.title.trim() }),
      ...(data.description !== undefined && { description: data.description.trim() }),
      ...(data.genderRequirement !== undefined && { genderRequirement: data.genderRequirement }),
      ...(data.minAge !== undefined && { minAge: data.minAge }),
      ...(data.maxAge !== undefined && { maxAge: data.maxAge }),
      ...(data.status !== undefined && { status: data.status })
    }
  });

  return updatedRole;
};

export const publishProject = async (
  userId: string,
  projectId: string
) => {
  const casterProfile = await prisma.casterProfile.findUnique({
    where: { userId }
  });

  if (!casterProfile) {
    throw new Error("Caster profile not found");
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      castingRoles: true
    }
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.casterId !== casterProfile.id) {
    throw new Error("Forbidden: You do not have permission to manage this project");
  }

  if (project.status === "CLOSED") {
    throw new Error("Cannot publish a closed project");
  }

  // Mandatory business rule: minimum 1 role before publication
  if (!project.castingRoles || project.castingRoles.length === 0) {
    throw new Error("Cannot publish project: A project must have at least one casting role before publication.");
  }

  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: {
      status: "PUBLISHED"
    },
    include: {
      castingRoles: true,
      caster: {
        select: {
          id: true,
          displayName: true,
          bio: true
        }
      }
    }
  });

  return updatedProject;
};

export const closeProject = async (
  userId: string,
  projectId: string
) => {
  const casterProfile = await prisma.casterProfile.findUnique({
    where: { userId }
  });

  if (!casterProfile) {
    throw new Error("Caster profile not found");
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.casterId !== casterProfile.id) {
    throw new Error("Forbidden: You do not have permission to manage this project");
  }

  // Transactionally close project and all its open casting roles
  const closedProject = await prisma.$transaction(async (tx: any) => {
    await tx.castingRole.updateMany({
      where: {
        projectId,
        status: "OPEN"
      },
      data: {
        status: "CLOSED"
      }
    });

    return tx.project.update({
      where: { id: projectId },
      data: {
        status: "CLOSED"
      },
      include: {
        castingRoles: true,
        caster: {
          select: {
            id: true,
            displayName: true,
            bio: true
          }
        }
      }
    });
  });

  return closedProject;
};

export const updateProject = async (
  userId: string,
  projectId: string,
  data: UpdateProjectInput
) => {
  const casterProfile = await prisma.casterProfile.findUnique({
    where: { userId }
  });

  if (!casterProfile) {
    throw new Error("Caster profile not found");
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.casterId !== casterProfile.id) {
    throw new Error("Forbidden: You do not have permission to manage this project");
  }

  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: {
      ...(data.title !== undefined && { title: data.title.trim() }),
      ...(data.description !== undefined && { description: data.description.trim() }),
      ...(data.projectType !== undefined && { projectType: data.projectType }),
      ...(data.location !== undefined && { location: data.location.trim() }),
      ...(data.startDate !== undefined && { startDate: data.startDate ? new Date(data.startDate) : null }),
      ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
      ...(data.applicationDeadline !== undefined && {
        applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline) : null
      })
    },
    include: {
      castingRoles: true,
      caster: {
        select: {
          id: true,
          displayName: true,
          bio: true
        }
      }
    }
  });

  return updatedProject;
};

export const getMyProjects = async (userId: string) => {
  const casterProfile = await prisma.casterProfile.findUnique({
    where: { userId }
  });

  if (!casterProfile) {
    throw new Error("Caster profile not found");
  }

  const projects = await prisma.project.findMany({
    where: { casterId: casterProfile.id },
    include: {
      castingRoles: {
        include: {
          _count: {
            select: { applications: true }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return projects;
};

export const getPublicProjects = async () => {
  const projects = await prisma.project.findMany({
    where: { status: "PUBLISHED" },
    include: {
      castingRoles: {
        where: { status: "OPEN" }
      },
      caster: {
        select: {
          id: true,
          displayName: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return projects;
};

export const getProjectById = async (
  projectId: string,
  callerUserId?: string
) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      castingRoles: true,
      caster: {
        select: {
          id: true,
          displayName: true,
          bio: true,
          userId: true
        }
      }
    }
  });

  if (!project) {
    return null;
  }

  // If project is DRAFT, only the owner caster can view it
  if (project.status === "DRAFT") {
    if (!callerUserId || project.caster.userId !== callerUserId) {
      return null;
    }
  }

  return project;
};
