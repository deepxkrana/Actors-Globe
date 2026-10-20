import type { Request, Response } from "express";
import * as adminService from "../services/admin.service.js";

export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const password = req.body.password || req.body.secretKey;
    const { admin, token } = await adminService.loginAdmin(email, password);

    // Set secure HttpOnly cookie for admin session
    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 12 * 60 * 60 * 1000 // 12 hours
    });

    return res.status(200).json({
      success: true,
      message: "Admin authentication successful",
      data: {
        admin,
        token
      }
    });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Admin login failed"
    });
  }
};

export const adminLogout = async (_req: Request, res: Response) => {
  res.clearCookie("adminToken");
  return res.status(200).json({
    success: true,
    message: "Admin logged out successfully"
  });
};

export const getAdminMe = async (req: Request, res: Response) => {
  try {
    const adminId = req.admin?.adminId;
    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const admin = await adminService.getAdminProfile(adminId);
    return res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch admin profile"
    });
  }
};

export const getDashboardStats = async (_req: Request, res: Response) => {
  try {
    const stats = await adminService.getModerationStats();
    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch moderation dashboard statistics"
    });
  }
};

export const getReports = async (req: Request, res: Response) => {
  try {
    const status = req.query.status as any;
    const targetType = req.query.targetType as any;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const result = await adminService.getReports({
      status,
      targetType,
      page,
      limit
    });

    return res.status(200).json({
      success: true,
      data: result.reports,
      pagination: result.pagination
    });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch reports"
    });
  }
};

export const getReportDetails = async (req: Request, res: Response) => {
  try {
    const reportId = req.params.id as string;
    const result = await adminService.getReportById(reportId);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch report details"
    });
  }
};

export const updateReport = async (req: Request, res: Response) => {
  try {
    const reportId = req.params.id as string;
    const adminId = req.admin?.adminId;
    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { status, resolutionNote } = req.body;
    const updated = await adminService.updateReportStatus(reportId, adminId, {
      status,
      resolutionNote
    });

    return res.status(200).json({
      success: true,
      message: `Report status updated to ${status}`,
      data: updated
    });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update report status"
    });
  }
};

export const moderateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id as string;
    const adminId = req.admin?.adminId;
    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { isActive, reason } = req.body;
    const updatedUser = await adminService.updateUserModerationStatus(
      userId,
      isActive,
      adminId,
      reason
    );

    return res.status(200).json({
      success: true,
      message: isActive ? "User account reactivated" : "User account suspended",
      data: updatedUser
    });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update user moderation status"
    });
  }
};
