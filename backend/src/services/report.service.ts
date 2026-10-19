import prisma from "../config/prisma.js";
import type { CreateReportInput } from "../types/report.js";

/**
 * Creates a moderation report submitted by an authenticated user.
 * Validates that the target entity exists and resolves the reported user ID.
 */
export const createReport = async (
  reporterId: string,
  input: CreateReportInput
) => {
  let reportedUserId = input.reportedUserId;

  // 1. Validate that target entity exists and resolve reportedUserId
  switch (input.targetType) {
    case "USER": {
      const targetUser = await prisma.user.findUnique({
        where: { id: input.targetId }
      });
      if (!targetUser) {
        const error: any = new Error("Reported user does not exist");
        error.statusCode = 404;
        throw error;
      }
      if (targetUser.id === reporterId) {
        const error: any = new Error("You cannot submit a report against your own account");
        error.statusCode = 400;
        throw error;
      }
      reportedUserId = targetUser.id;
      break;
    }

    case "PROFILE": {
      const actorProf = await prisma.actorProfile.findUnique({
        where: { id: input.targetId }
      });
      const casterProf = !actorProf
        ? await prisma.casterProfile.findUnique({
            where: { id: input.targetId }
          })
        : null;

      if (!actorProf && !casterProf) {
        const error: any = new Error("Reported profile does not exist");
        error.statusCode = 404;
        throw error;
      }
      reportedUserId = actorProf ? actorProf.userId : casterProf!.userId;
      if (reportedUserId === reporterId) {
        const error: any = new Error("You cannot submit a report against your own profile");
        error.statusCode = 400;
        throw error;
      }
      break;
    }

    case "PROJECT": {
      const project = await prisma.project.findUnique({
        where: { id: input.targetId },
        include: { caster: true }
      });
      if (!project) {
        const error: any = new Error("Reported project does not exist");
        error.statusCode = 404;
        throw error;
      }
      reportedUserId = project.caster.userId;
      break;
    }

    case "CASTING_ROLE": {
      const role = await prisma.castingRole.findUnique({
        where: { id: input.targetId },
        include: { project: { include: { caster: true } } }
      });
      if (!role) {
        const error: any = new Error("Reported casting role does not exist");
        error.statusCode = 404;
        throw error;
      }
      reportedUserId = role.project.caster.userId;
      break;
    }

    case "MEDIA": {
      const media = await prisma.media.findUnique({
        where: { id: input.targetId },
        include: { actor: true }
      });
      if (!media) {
        const error: any = new Error("Reported media does not exist");
        error.statusCode = 404;
        throw error;
      }
      reportedUserId = media.actor.userId;
      break;
    }

    case "MESSAGE": {
      const message = await prisma.message.findUnique({
        where: { id: input.targetId }
      });
      if (!message) {
        const error: any = new Error("Reported message does not exist");
        error.statusCode = 404;
        throw error;
      }
      reportedUserId = message.senderId || undefined;
      break;
    }
  }

  // 2. Prevent duplicate open reports for the same target by the same reporter
  const existingOpenReport = await prisma.report.findFirst({
    where: {
      reporterId,
      targetType: input.targetType,
      targetId: input.targetId,
      status: { in: ["PENDING", "UNDER_REVIEW"] }
    }
  });

  if (existingOpenReport) {
    const error: any = new Error(
      "You already have an active report under review for this item"
    );
    error.statusCode = 400;
    throw error;
  }

  // 3. Create report
  const report = await prisma.report.create({
    data: {
      reporterId,
      reportedUserId: reportedUserId || null,
      targetType: input.targetType,
      targetId: input.targetId,
      reason: input.reason,
      description: input.description || null,
      status: "PENDING"
    }
  });

  return report;
};

/**
 * Retrieves reports submitted by the authenticated user.
 */
export const getUserReports = async (
  reporterId: string,
  pagination: { page: number; limit: number }
) => {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  const [total, reports] = await Promise.all([
    prisma.report.count({
      where: { reporterId }
    }),
    prisma.report.findMany({
      where: { reporterId },
      select: {
        id: true,
        targetType: true,
        targetId: true,
        reason: true,
        description: true,
        status: true,
        resolutionNote: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    })
  ]);

  return {
    reports,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};
