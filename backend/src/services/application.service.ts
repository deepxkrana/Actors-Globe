import prisma from "../config/prisma.js";
import { calculateAge } from "./profile.service.js";
import { getStorageProvider } from "../utils/storage.js";
import type {
  ApplyToRoleInput,
  UpdateApplicationStatusInput,
  ApplicationQuery
} from "../types/application.js";

export const applyToRole = async (
  actorUserId: string,
  data: ApplyToRoleInput
) => {
  const actorProfile = await prisma.actorProfile.findUnique({
    where: { userId: actorUserId }
  });

  if (!actorProfile) {
    throw new Error("Actor profile not found. Please create an actor profile before applying.");
  }

  const role = await prisma.castingRole.findUnique({
    where: { id: data.castingRoleId },
    include: {
      project: {
        include: {
          caster: true
        }
      }
    }
  });

  if (!role) {
    throw new Error("Casting role not found");
  }

  if (role.status !== "OPEN") {
    throw new Error("This casting role is no longer open for applications");
  }

  if (role.project.status !== "PUBLISHED") {
    throw new Error("Cannot apply to roles in an unpublished or closed project");
  }

  if (role.project.applicationDeadline && new Date() > new Date(role.project.applicationDeadline)) {
    throw new Error("The application deadline for this project has passed");
  }

  // Duplicate prevention check
  const existingApplication = await prisma.application.findUnique({
    where: {
      actorId_castingRoleId: {
        actorId: actorProfile.id,
        castingRoleId: role.id
      }
    }
  });

  if (existingApplication) {
    throw new Error("Conflict: You have already applied for this casting role");
  }

  const application = await prisma.$transaction(async (tx: any) => {
    const app = await tx.application.create({
      data: {
        actorId: actorProfile.id,
        castingRoleId: role.id,
        status: "PENDING"
      },
      include: {
        castingRole: {
          include: {
            project: {
              select: {
                id: true,
                title: true,
                projectType: true,
                location: true,
                applicationDeadline: true
              }
            }
          }
        }
      }
    });

    // Notify project caster
    await tx.notification.create({
      data: {
        userId: role.project.caster.userId,
        type: "GENERAL",
        title: "New Application Received",
        message: `${actorProfile.displayName} has applied for "${role.title}" in "${role.project.title}"`,
        referenceId: app.id
      }
    });

    return app;
  });

  return application;
};

export const getActorApplications = async (
  actorUserId: string,
  query: ApplicationQuery
) => {
  const actorProfile = await prisma.actorProfile.findUnique({
    where: { userId: actorUserId }
  });

  if (!actorProfile) {
    throw new Error("Actor profile not found");
  }

  const page = Math.max(1, query.page || 1);
  const limit = Math.min(50, Math.max(1, query.limit || 10));
  const skip = (page - 1) * limit;

  const where: any = { actorId: actorProfile.id };
  if (query.status) {
    where.status = query.status;
  }

  const [total, applications] = await Promise.all([
    prisma.application.count({ where }),
    prisma.application.findMany({
      where,
      skip,
      take: limit,
      orderBy: { appliedAt: "desc" },
      include: {
        castingRole: {
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
        }
      }
    })
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    applications,
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

export const getCasterRoleApplications = async (
  casterUserId: string,
  roleId: string,
  query: ApplicationQuery
) => {
  const casterProfile = await prisma.casterProfile.findUnique({
    where: { userId: casterUserId }
  });

  if (!casterProfile) {
    throw new Error("Caster profile not found");
  }

  const role = await prisma.castingRole.findUnique({
    where: { id: roleId },
    include: { project: true }
  });

  if (!role) {
    throw new Error("Casting role not found");
  }

  if (role.project.casterId !== casterProfile.id) {
    throw new Error("Forbidden: You do not have permission to view applications for this role");
  }

  const page = Math.max(1, query.page || 1);
  const limit = Math.min(50, Math.max(1, query.limit || 10));
  const skip = (page - 1) * limit;

  const where: any = { castingRoleId: roleId };
  if (query.status) {
    where.status = query.status;
  }

  const [total, applications] = await Promise.all([
    prisma.application.count({ where }),
    prisma.application.findMany({
      where,
      skip,
      take: limit,
      orderBy: { appliedAt: "desc" },
      include: {
        actor: {
          include: {
            experiences: {
              orderBy: { startDate: "desc" }
            },
            media: {
              orderBy: { createdAt: "desc" }
            }
          }
        }
      }
    })
  ]);

  const storage = getStorageProvider();

  // Sanitize actor profile to protect privacy
  const sanitizedApplications = applications.map((app: any) => ({
    id: app.id,
    castingRoleId: app.castingRoleId,
    status: app.status,
    appliedAt: app.appliedAt,
    updatedAt: app.updatedAt,
    actor: {
      id: app.actor.id,
      displayName: app.actor.displayName,
      age: calculateAge(app.actor.dateOfBirth),
      gender: app.actor.gender,
      bio: app.actor.bio,
      skills: app.actor.skills,
      experiences: app.actor.experiences,
      media: app.actor.media.map((m: any) => ({
        id: m.id,
        type: m.type,
        url: storage.getUrl(m.storageKey),
        originalFileName: m.originalFileName
      }))
      // Sensitive fields (sexualOrientation, dateOfBirth, user email/phone) are strictly omitted
    }
  }));

  const totalPages = Math.ceil(total / limit);

  return {
    applications: sanitizedApplications,
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

export const getApplicationById = async (
  userId: string,
  applicationId: string
) => {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      actor: {
        include: {
          experiences: {
            orderBy: { startDate: "desc" }
          },
          media: {
            orderBy: { createdAt: "desc" }
          }
        }
      },
      castingRole: {
        include: {
          project: {
            include: {
              caster: {
                select: {
                  id: true,
                  userId: true,
                  displayName: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!application) {
    throw new Error("Application not found");
  }

  const isActor = application.actor.userId === userId;
  const isCaster = application.castingRole.project.caster.userId === userId;

  if (!isActor && !isCaster) {
    throw new Error("Forbidden: You do not have permission to view this application");
  }

  const storage = getStorageProvider();

  return {
    id: application.id,
    status: application.status,
    appliedAt: application.appliedAt,
    updatedAt: application.updatedAt,
    castingRole: {
      id: application.castingRole.id,
      title: application.castingRole.title,
      description: application.castingRole.description,
      genderRequirement: application.castingRole.genderRequirement,
      minAge: application.castingRole.minAge,
      maxAge: application.castingRole.maxAge,
      status: application.castingRole.status,
      project: {
        id: application.castingRole.project.id,
        title: application.castingRole.project.title,
        projectType: application.castingRole.project.projectType,
        location: application.castingRole.project.location,
        applicationDeadline: application.castingRole.project.applicationDeadline,
        caster: {
          id: application.castingRole.project.caster.id,
          displayName: application.castingRole.project.caster.displayName
        }
      }
    },
    actor: {
      id: application.actor.id,
      displayName: application.actor.displayName,
      age: calculateAge(application.actor.dateOfBirth),
      gender: application.actor.gender,
      bio: application.actor.bio,
      skills: application.actor.skills,
      experiences: application.actor.experiences,
      media: application.actor.media.map((m: any) => ({
        id: m.id,
        type: m.type,
        url: storage.getUrl(m.storageKey),
        originalFileName: m.originalFileName
      }))
    }
  };
};

export const updateApplicationStatus = async (
  casterUserId: string,
  applicationId: string,
  data: UpdateApplicationStatusInput
) => {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      actor: true,
      castingRole: {
        include: {
          project: {
            include: { caster: true }
          }
        }
      }
    }
  });

  if (!application) {
    throw new Error("Application not found");
  }

  if (application.castingRole.project.caster.userId !== casterUserId) {
    throw new Error("Forbidden: You do not have permission to update this application");
  }

  if (application.status === data.status) {
    return application;
  }

  const updatedApplication = await prisma.$transaction(async (tx: any) => {
    const updated = await tx.application.update({
      where: { id: applicationId },
      data: { status: data.status },
      include: {
        castingRole: {
          include: {
            project: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      }
    });

    const notifType =
      data.status === "ACCEPTED"
        ? "APPLICATION_ACCEPTED"
        : "APPLICATION_REJECTED";

    const notifTitle =
      data.status === "ACCEPTED"
        ? "Application Accepted!"
        : "Application Status Update";

    const notifMessage =
      data.status === "ACCEPTED"
        ? `Congratulations! Your application for "${application.castingRole.title}" in "${application.castingRole.project.title}" has been accepted.`
        : `Your application for "${application.castingRole.title}" in "${application.castingRole.project.title}" was not selected.`;

    await tx.notification.create({
      data: {
        userId: application.actor.userId,
        type: notifType,
        title: notifTitle,
        message: notifMessage,
        referenceId: application.id
      }
    });

    return updated;
  });

  return updatedApplication;
};

export const withdrawApplication = async (
  actorUserId: string,
  applicationId: string
) => {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { actor: true }
  });

  if (!application) {
    throw new Error("Application not found");
  }

  if (application.actor.userId !== actorUserId) {
    throw new Error("Forbidden: You can only withdraw your own applications");
  }

  if (application.status !== "PENDING") {
    throw new Error("Cannot withdraw an application that has already been accepted or rejected");
  }

  await prisma.application.delete({
    where: { id: applicationId }
  });

  return { success: true, message: "Application withdrawn successfully" };
};
