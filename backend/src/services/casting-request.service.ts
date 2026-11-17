import prisma from "../config/prisma.js";
import { calculateAge } from "./profile.service.js";
import type {
  CreateCastingRequestInput,
  UpdateCastingRequestStatusInput,
  CastingRequestQuery
} from "../types/casting-request.js";

export const createCastingRequest = async (
  casterUserId: string,
  data: CreateCastingRequestInput
) => {
  const casterProfile = await prisma.casterProfile.findUnique({
    where: { userId: casterUserId }
  });

  if (!casterProfile) {
    throw new Error("Caster profile not found. Please create a caster profile first.");
  }

  const actorProfile = await prisma.actorProfile.findUnique({
    where: { id: data.actorId },
    include: { user: true }
  });

  if (!actorProfile || !actorProfile.user.isActive) {
    throw new Error("Actor profile not found or is currently inactive");
  }

  // Validate casting role if provided
  if (data.castingRoleId) {
    const role = await prisma.castingRole.findUnique({
      where: { id: data.castingRoleId },
      include: { project: true }
    });

    if (!role) {
      throw new Error("Casting role not found");
    }

    if (role.project.casterId !== casterProfile.id) {
      throw new Error("Forbidden: You do not own the project for this casting role");
    }

    if (role.status !== "OPEN") {
      throw new Error("Cannot send casting request for a closed casting role");
    }

    if (role.project.status !== "PUBLISHED") {
      throw new Error("Cannot send casting request for an unpublished project");
    }
  }

  // Duplicate prevention check
  const existingPendingRequest = await prisma.castingRequest.findFirst({
    where: {
      casterId: casterProfile.id,
      actorId: data.actorId,
      castingRoleId: data.castingRoleId || null,
      status: "PENDING"
    }
  });

  if (existingPendingRequest) {
    throw new Error("Conflict: A pending casting request already exists for this actor");
  }

  const request = await prisma.$transaction(async (tx: any) => {
    const req = await tx.castingRequest.create({
      data: {
        casterId: casterProfile.id,
        actorId: data.actorId,
        castingRoleId: data.castingRoleId || null,
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
                location: true
              }
            }
          }
        },
        caster: {
          select: {
            id: true,
            displayName: true,
            bio: true
          }
        }
      }
    });

    const roleDetail = req.castingRole
      ? ` for role "${req.castingRole.title}" in "${req.castingRole.project.title}"`
      : "";

    await tx.notification.create({
      data: {
        userId: actorProfile.user.id,
        type: "CASTING_REQUEST_RECEIVED",
        title: "New Casting Request Received",
        message: `${casterProfile.displayName} has sent you a casting request${roleDetail}.`,
        referenceId: req.id
      }
    });

    return req;
  });

  return request;
};

export const getActorCastingRequests = async (
  actorUserId: string,
  query: CastingRequestQuery
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

  const [total, requests] = await Promise.all([
    prisma.castingRequest.count({ where }),
    prisma.castingRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        caster: {
          select: {
            id: true,
            displayName: true,
            bio: true
          }
        },
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
    })
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    requests,
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

export const getCasterSentCastingRequests = async (
  casterUserId: string,
  query: CastingRequestQuery
) => {
  const casterProfile = await prisma.casterProfile.findUnique({
    where: { userId: casterUserId }
  });

  if (!casterProfile) {
    throw new Error("Caster profile not found");
  }

  const page = Math.max(1, query.page || 1);
  const limit = Math.min(50, Math.max(1, query.limit || 10));
  const skip = (page - 1) * limit;

  const where: any = { casterId: casterProfile.id };
  if (query.status) {
    where.status = query.status;
  }

  const [total, requests] = await Promise.all([
    prisma.castingRequest.count({ where }),
    prisma.castingRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        actor: {
          include: {
            experiences: {
              orderBy: { startDate: "desc" }
            }
          }
        },
        castingRole: {
          include: {
            project: {
              select: {
                id: true,
                title: true,
                projectType: true,
                location: true
              }
            }
          }
        }
      }
    })
  ]);

  // Sanitize actor profile
  const sanitizedRequests = requests.map((req: any) => ({
    id: req.id,
    casterId: req.casterId,
    castingRoleId: req.castingRoleId,
    status: req.status,
    createdAt: req.createdAt,
    updatedAt: req.updatedAt,
    castingRole: req.castingRole,
    actor: {
      id: req.actor.id,
      displayName: req.actor.displayName,
      age: calculateAge(req.actor.dateOfBirth),
      gender: req.actor.gender,
      bio: req.actor.bio,
      skills: req.actor.skills,
      experiences: req.actor.experiences
    }
  }));

  const totalPages = Math.ceil(total / limit);

  return {
    requests: sanitizedRequests,
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

export const getCastingRequestById = async (
  userId: string,
  requestId: string
) => {
  const request = await prisma.castingRequest.findUnique({
    where: { id: requestId },
    include: {
      actor: {
        include: {
          user: true,
          experiences: {
            orderBy: { startDate: "desc" }
          }
        }
      },
      caster: {
        include: {
          user: true
        }
      },
      castingRole: {
        include: {
          project: true
        }
      }
    }
  });

  if (!request) {
    throw new Error("Casting request not found");
  }

  const isActor = request.actor.userId === userId;
  const isCaster = request.caster.userId === userId;

  if (!isActor && !isCaster) {
    throw new Error("Forbidden: You do not have access to this casting request");
  }

  return {
    id: request.id,
    status: request.status,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    castingRole: request.castingRole,
    caster: {
      id: request.caster.id,
      displayName: request.caster.displayName,
      bio: request.caster.bio
    },
    actor: {
      id: request.actor.id,
      displayName: request.actor.displayName,
      age: calculateAge(request.actor.dateOfBirth),
      gender: request.actor.gender,
      bio: request.actor.bio,
      skills: request.actor.skills,
      experiences: request.actor.experiences
    }
  };
};

export const respondToCastingRequest = async (
  actorUserId: string,
  requestId: string,
  data: UpdateCastingRequestStatusInput
) => {
  const request = await prisma.castingRequest.findUnique({
    where: { id: requestId },
    include: {
      actor: true,
      caster: true,
      castingRole: {
        include: { project: true }
      }
    }
  });

  if (!request) {
    throw new Error("Casting request not found");
  }

  if (request.actor.userId !== actorUserId) {
    throw new Error("Forbidden: Only the recipient actor can respond to this casting request");
  }

  if (request.status !== "PENDING") {
    throw new Error("Cannot respond to a casting request that is no longer pending");
  }

  const updatedRequest = await prisma.$transaction(async (tx: any) => {
    const updated = await tx.castingRequest.update({
      where: { id: requestId },
      data: { status: data.status },
      include: {
        castingRole: {
          include: { project: true }
        }
      }
    });

    const notifType =
      data.status === "ACCEPTED"
        ? "CASTING_REQUEST_ACCEPTED"
        : "CASTING_REQUEST_REJECTED";

    const notifTitle =
      data.status === "ACCEPTED"
        ? "Casting Request Accepted!"
        : "Casting Request Declined";

    const roleInfo = request.castingRole
      ? ` for role "${request.castingRole.title}" in "${request.castingRole.project.title}"`
      : "";

    const notifMessage =
      data.status === "ACCEPTED"
        ? `${request.actor.displayName} has accepted your casting request${roleInfo}.`
        : `${request.actor.displayName} has declined your casting request${roleInfo}.`;

    await tx.notification.create({
      data: {
        userId: request.caster.userId,
        type: notifType,
        title: notifTitle,
        message: notifMessage,
        referenceId: request.id
      }
    });

    return updated;
  });

  return updatedRequest;
};

export const withdrawCastingRequest = async (
  casterUserId: string,
  requestId: string
) => {
  const request = await prisma.castingRequest.findUnique({
    where: { id: requestId },
    include: { caster: true }
  });

  if (!request) {
    throw new Error("Casting request not found");
  }

  if (request.caster.userId !== casterUserId) {
    throw new Error("Forbidden: Only the creator of the casting request can withdraw it");
  }

  if (request.status !== "PENDING") {
    throw new Error("Cannot withdraw a casting request that has already been accepted or rejected");
  }

  await prisma.castingRequest.delete({
    where: { id: requestId }
  });

  return { success: true, message: "Casting request withdrawn successfully" };
};
