import type { Request, Response } from "express";
import {
  applyToRole,
  getActorApplications,
  getCasterRoleApplications,
  getApplicationById,
  updateApplicationStatus,
  withdrawApplication
} from "../services/application.service.js";

export const applyToRoleHandler = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const application = await applyToRole(req.user.userId, req.body);

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: application
    });
  } catch (error: any) {
    const message = error.message || "Failed to submit application";
    const statusCode = message.includes("Conflict")
      ? 409
      : message.includes("Forbidden")
      ? 403
      : message.includes("not found")
      ? 404
      : 400;

    res.status(statusCode).json({
      success: false,
      message
    });
  }
};

export const getActorApplicationsHandler = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const filters = (req as any).validatedQuery || req.query;
    const result = await getActorApplications(req.user.userId, filters);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch applications"
    });
  }
};

export const getCasterRoleApplicationsHandler = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const roleId = req.params.roleId as string;
    const filters = (req as any).validatedQuery || req.query;
    const result = await getCasterRoleApplications(req.user.userId, roleId, filters);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    const message = error.message || "Failed to fetch role applications";
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

export const getApplicationByIdHandler = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const applicationId = req.params.applicationId as string;
    const application = await getApplicationById(req.user.userId, applicationId);

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error: any) {
    const message = error.message || "Failed to fetch application details";
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

export const updateApplicationStatusHandler = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const applicationId = req.params.applicationId as string;
    const updated = await updateApplicationStatus(req.user.userId, applicationId, req.body);

    res.status(200).json({
      success: true,
      message: `Application marked as ${req.body.status}`,
      data: updated
    });
  } catch (error: any) {
    const message = error.message || "Failed to update application status";
    const statusCode = message.includes("Forbidden")
      ? 403
      : message.includes("not found")
      ? 404
      : 400;

    res.status(statusCode).json({
      success: false,
      message
    });
  }
};

export const withdrawApplicationHandler = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const applicationId = req.params.applicationId as string;
    const result = await withdrawApplication(req.user.userId, applicationId);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error: any) {
    const message = error.message || "Failed to withdraw application";
    const statusCode = message.includes("Forbidden")
      ? 403
      : message.includes("not found")
      ? 404
      : 400;

    res.status(statusCode).json({
      success: false,
      message
    });
  }
};
