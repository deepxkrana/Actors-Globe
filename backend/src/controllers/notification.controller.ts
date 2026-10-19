import type { Request, Response } from "express";
import {
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from "../services/notification.service.js";

export const getUserNotificationsHandler = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const filters = (req as any).validatedQuery || req.query;
    const result = await getUserNotifications(req.user.userId, filters);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch notifications"
    });
  }
};

export const getUnreadNotificationCountHandler = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const result = await getUnreadNotificationCount(req.user.userId);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch unread notification count"
    });
  }
};

export const markNotificationAsReadHandler = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const notificationId = req.params.notificationId as string;
    const result = await markNotificationAsRead(req.user.userId, notificationId);

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: result
    });
  } catch (error: any) {
    const message = error.message || "Failed to update notification";
    const statusCode = message.includes("Forbidden")
      ? 403
      : message.includes("not found")
      ? 404
      : 500;

    res.status(statusCode).json({
      success: false,
      message
    });
  }
};

export const markAllNotificationsAsReadHandler = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const result = await markAllNotificationsAsRead(req.user.userId);

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to mark all notifications as read"
    });
  }
};
