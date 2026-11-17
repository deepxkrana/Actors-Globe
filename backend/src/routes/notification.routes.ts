import { Router } from "express";
import {
  getUserNotificationsHandler,
  getUnreadNotificationCountHandler,
  markNotificationAsReadHandler,
  markAllNotificationsAsReadHandler
} from "../controllers/notification.controller.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

// List notifications for current user
router.get("/", authenticate, getUserNotificationsHandler);

// Get unread notification count
router.get("/unread-count", authenticate, getUnreadNotificationCountHandler);

// Mark all notifications as read
router.patch("/mark-all-read", authenticate, markAllNotificationsAsReadHandler);

// Mark single notification as read
router.patch("/:notificationId/read", authenticate, markNotificationAsReadHandler);

export default router;
