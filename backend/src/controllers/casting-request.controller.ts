import type { Request, Response } from "express";
import {
  createCastingRequest,
  getActorCastingRequests,
  getCasterSentCastingRequests,
  getCastingRequestById,
  respondToCastingRequest,
  withdrawCastingRequest
} from "../services/casting-request.service.js";

export const createCastingRequestHandler = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const request = await createCastingRequest(req.user.userId, req.body);

    res.status(201).json({
      success: true,
      message: "Casting request sent successfully",
      data: request
    });
  } catch (error: any) {
    const message = error.message || "Failed to send casting request";
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

export const getActorCastingRequestsHandler = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const filters = (req as any).validatedQuery || req.query;
    const result = await getActorCastingRequests(req.user.userId, filters);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch casting requests"
    });
  }
};

export const getCasterSentCastingRequestsHandler = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const filters = (req as any).validatedQuery || req.query;
    const result = await getCasterSentCastingRequests(req.user.userId, filters);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch sent casting requests"
    });
  }
};

export const getCastingRequestByIdHandler = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const requestId = req.params.requestId as string;
    const request = await getCastingRequestById(req.user.userId, requestId);

    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error: any) {
    const message = error.message || "Failed to fetch casting request";
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

export const respondToCastingRequestHandler = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const requestId = req.params.requestId as string;
    const updated = await respondToCastingRequest(req.user.userId, requestId, req.body);

    res.status(200).json({
      success: true,
      message: `Casting request ${req.body.status.toLowerCase()}`,
      data: updated
    });
  } catch (error: any) {
    const message = error.message || "Failed to respond to casting request";
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

export const withdrawCastingRequestHandler = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const requestId = req.params.requestId as string;
    const result = await withdrawCastingRequest(req.user.userId, requestId);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error: any) {
    const message = error.message || "Failed to withdraw casting request";
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
