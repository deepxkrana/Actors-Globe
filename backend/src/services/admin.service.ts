import prisma from "../config/prisma.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { signAdminToken } from "../utils/jwt.js";
import type {
  AdminTokenPayload,
  SafeAdmin,
  ModerationStats
} from "../types/admin.js";
import type {
  ReportFilterQuery,
  UpdateReportStatusInput
} from "../types/report.js";

/**
 * Ensures an admin account exists (for seeding/testing).
 */
export const ensureAdminAccount = async (
  name: string,
  email: string,
  password: string
): Promise<SafeAdmin> => {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await prisma.admin.findUnique({
    where: { email: normalizedEmail }
  });

  if (existing) {
    return {
      id: existing.id,
      name: existing.name,
      email: existing.email,
      createdAt: existing.createdAt,
      updatedAt: existing.updatedAt
    };
  }

  const passwordHash = await hashPassword(password);
  const admin = await prisma.admin.create({
    data: {
      name,
      email: normalizedEmail,
      passwordHash
    }
  });

  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt
  };
};

/**
 * Admin authentication verifying credentials and returning isolated admin JWT.
 */
export const loginAdmin = async (
  email: string,
  password: string
): Promise<{ admin: SafeAdmin; token: string }> => {
  const normalizedEmail = email.trim().toLowerCase();

  const admin = await prisma.admin.findUnique({
    where: { email: normalizedEmail }
  });

  if (!admin) {
    const error: any = new Error("Invalid admin credentials");
    error.statusCode = 401;
    throw error;
  }

  const isValidPassword = await verifyPassword(admin.passwordHash, password);
  if (!isValidPassword) {
    const error: any = new Error("Invalid admin credentials");
    error.statusCode = 401;
    throw error;
  }

  const payload: AdminTokenPayload = {
    adminId: admin.id,
    email: admin.email,
    name: admin.name,
    role: "ADMIN"
  };

  const token = signAdminToken(payload);

  return {
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt
    },
    token
  };
};

/**
 * Retrieves the profile of an authenticated admin.
 */
export const getAdminProfile = async (adminId: string): Promise<SafeAdmin> => {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId }
  });

  if (!admin) {
    const error: any = new Error("Admin not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt
  };
};

/**
 * Compiles moderation metrics and report counts for the Admin Dashboard.
 */
export const getModerationStats = async (): Promise<ModerationStats> => {
  const [
    totalReports,
    pendingReports,
    underReviewReports,
    resolvedReports,
    dismissedReports,
    userReports,
    profileReports,
    projectReports,
    roleReports,
    mediaReports,
    messageReports,
    recentReports
  ] = await Promise.all([
    prisma.report.count(),
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.report.count({ where: { status: "UNDER_REVIEW" } }),
    prisma.report.count({ where: { status: "RESOLVED" } }),
    prisma.report.count({ where: { status: "DISMISSED" } }),
    prisma.report.count({ where: { targetType: "USER" } }),
    prisma.report.count({ where: { targetType: "PROFILE" } }),
    prisma.report.count({ where: { targetType: "PROJECT" } }),
    prisma.report.count({ where: { targetType: "CASTING_ROLE" } }),
    prisma.report.count({ where: { targetType: "MEDIA" } }),
    prisma.report.count({ where: { targetType: "MESSAGE" } }),
    prisma.report.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        reporter: {
          select: { id: true, name: true, email: true, role: true }
        },
        reportedUser: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    })
  ]);

  return {
    totalReports,
    pendingReports,
    underReviewReports,
    resolvedReports,
    dismissedReports,
    byTargetType: {
      USER: userReports,
      PROFILE: profileReports,
      PROJECT: projectReports,
      CASTING_ROLE: roleReports,
      MEDIA: mediaReports,
      MESSAGE: messageReports
    },
    recentReports
  };
};

/**
 * Retrieves paginated reports with optional status and targetType filters.
 */
export const getReports = async (query: ReportFilterQuery) => {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (query.status) {
    where.status = query.status;
  }
  if (query.targetType) {
    where.targetType = query.targetType;
  }

  const [total, reports] = await Promise.all([
    prisma.report.count({ where }),
    prisma.report.findMany({
      where,
      include: {
        reporter: {
          select: { id: true, name: true, email: true, role: true }
        },
        reportedUser: {
          select: { id: true, name: true, email: true, role: true }
        },
        admin: {
          select: { id: true, name: true, email: true }
        }
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

/**
 * Retrieves full report details along with dynamically resolved target entity data.
 */
export const getReportById = async (reportId: string) => {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: {
      reporter: {
        select: { id: true, name: true, email: true, phone: true, role: true }
      },
      reportedUser: {
        select: { id: true, name: true, email: true, phone: true, role: true, isActive: true }
      },
      admin: {
        select: { id: true, name: true, email: true }
      }
    }
  });

  if (!report) {
    const error: any = new Error("Report not found");
    error.statusCode = 404;
    throw error;
  }

  // Dynamically resolve target entity for investigation
  let targetDetails: any = null;

  try {
    switch (report.targetType) {
      case "USER":
        targetDetails = await prisma.user.findUnique({
          where: { id: report.targetId },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            isActive: true,
            createdAt: true
          }
        });
        break;

      case "PROFILE":
        targetDetails =
          (await prisma.actorProfile.findUnique({
            where: { id: report.targetId },
            include: { user: { select: { id: true, name: true, email: true } } }
          })) ||
          (await prisma.casterProfile.findUnique({
            where: { id: report.targetId },
            include: { user: { select: { id: true, name: true, email: true } } }
          }));
        break;

      case "PROJECT":
        targetDetails = await prisma.project.findUnique({
          where: { id: report.targetId },
          include: {
            caster: {
              include: { user: { select: { id: true, name: true, email: true } } }
            },
            castingRoles: true
          }
        });
        break;

      case "CASTING_ROLE":
        targetDetails = await prisma.castingRole.findUnique({
          where: { id: report.targetId },
          include: {
            project: {
              include: {
                caster: {
                  include: { user: { select: { id: true, name: true, email: true } } }
                }
              }
            }
          }
        });
        break;

      case "MEDIA":
        targetDetails = await prisma.media.findUnique({
          where: { id: report.targetId },
          include: {
            actor: {
              include: { user: { select: { id: true, name: true, email: true } } }
            }
          }
        });
        break;

      case "MESSAGE":
        targetDetails = await prisma.message.findUnique({
          where: { id: report.targetId },
          include: {
            sender: { select: { id: true, name: true, email: true, role: true } }
          }
        });
        break;
    }
  } catch {
    // If target was deleted or could not be loaded, details remain null
    targetDetails = null;
  }

  return {
    report,
    targetDetails
  };
};

/**
 * Updates a report's status and records resolution notes.
 */
export const updateReportStatus = async (
  reportId: string,
  adminId: string,
  input: UpdateReportStatusInput
) => {
  const report = await prisma.report.findUnique({
    where: { id: reportId }
  });

  if (!report) {
    const error: any = new Error("Report not found");
    error.statusCode = 404;
    throw error;
  }

  const updatedReport = await prisma.$transaction(async (tx: any) => {
    const updated = await tx.report.update({
      where: { id: reportId },
      data: {
        status: input.status,
        adminId,
        resolutionNote: input.resolutionNote || null
      },
      include: {
        admin: { select: { id: true, name: true, email: true } },
        reporter: { select: { id: true, name: true, email: true } },
        reportedUser: { select: { id: true, name: true, email: true } }
      }
    });

    // Notify the reporter of the resolution update
    if (report.reporterId) {
      await tx.notification.create({
        data: {
          userId: report.reporterId,
          type: "GENERAL",
          title: "Report Status Updated",
          message: `Your report regarding a ${report.targetType.toLowerCase()} has been marked as ${input.status}.`,
          referenceId: report.id
        }
      });
    }

    return updated;
  });

  return updatedReport;
};

/**
 * Admin action to suspend/deactivate or reactivate an offending user account.
 */
export const updateUserModerationStatus = async (
  userId: string,
  isActive: boolean,
  _adminId: string,
  reason: string
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    const error: any = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const updatedUser = await prisma.$transaction(async (tx: any) => {
    const updated = await tx.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true
      }
    });

    await tx.notification.create({
      data: {
        userId,
        type: "GENERAL",
        title: isActive ? "Account Reactivated" : "Account Suspended",
        message: isActive
          ? "Your account access has been restored."
          : `Your account has been deactivated by moderation: ${reason}`
      }
    });

    return updated;
  });

  return updatedUser;
};
