import prisma from "../config/prisma.js";
import type {
  CreateNotificationInput,
  NotificationQuery
} from "../types/notification.js";

export const createNotification = async (data: CreateNotificationInput) => {
  return prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      title: data.title.trim(),
      message: data.message.trim(),
      referenceId: data.referenceId || null
    }
  });
};

export const getUserNotifications = async (
  userId: string,
  query: NotificationQuery
) => {
  const page = Math.max(1, query.page || 1);
  const limit = Math.min(50, Math.max(1, query.limit || 10));
  const skip = (page - 1) * limit;

  const where: any = { userId };
  if (query.isRead !== undefined) {
    where.isRead = query.isRead;
  }

  const [total, notifications] = await Promise.all([
    prisma.notification.count({ where }),
    prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" }
    })
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    notifications,
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

export const getUnreadNotificationCount = async (userId: string) => {
  const count = await prisma.notification.count({
    where: {
      userId,
      isRead: false
    }
  });

  return { unreadCount: count };
};

export const markNotificationAsRead = async (
  userId: string,
  notificationId: string
) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId }
  });

  if (!notification) {
    throw new Error("Notification not found");
  }

  if (notification.userId !== userId) {
    throw new Error("Forbidden: You cannot modify another user's notification");
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true }
  });
};

export const markAllNotificationsAsRead = async (userId: string) => {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false
    },
    data: { isRead: true }
  });

  return { updatedCount: result.count };
};
