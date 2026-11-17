import type { Request, Response } from "express";
import * as reportService from "../services/report.service.js";

export const submitReport = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const report = await reportService.createReport(userId, req.body);

    return res.status(201).json({
      success: true,
      message: "Report submitted successfully and queued for moderation review",
      data: report
    });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to submit report"
    });
  }
};

export const getMyReports = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const result = await reportService.getUserReports(userId, { page, limit });

    return res.status(200).json({
      success: true,
      data: result.reports,
      pagination: result.pagination
    });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch your reports"
    });
  }
};
