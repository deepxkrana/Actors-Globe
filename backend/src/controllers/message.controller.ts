import type { Request, Response } from "express";
import {
  getOrCreateConversation,
  getUserConversations,
  getConversationById,
  getConversationMessages,
  sendMessage
} from "../services/message.service.js";

export const createConversationHandler = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const conversation = await getOrCreateConversation(req.user.userId, req.body);

    res.status(200).json({
      success: true,
      data: conversation
    });
  } catch (error: any) {
    const message = error.message || "Failed to create or retrieve conversation";
    const statusCode = message.includes("not found")
      ? 404
      : message.includes("Forbidden")
      ? 403
      : 400;

    res.status(statusCode).json({
      success: false,
      message
    });
  }
};

export const getUserConversationsHandler = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const filters = (req as any).validatedQuery || req.query;
    const result = await getUserConversations(req.user.userId, filters);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch conversations"
    });
  }
};

export const getConversationByIdHandler = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const conversationId = req.params.conversationId as string;
    const conversation = await getConversationById(req.user.userId, conversationId);

    res.status(200).json({
      success: true,
      data: conversation
    });
  } catch (error: any) {
    const message = error.message || "Failed to fetch conversation";
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

export const getConversationMessagesHandler = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const conversationId = req.params.conversationId as string;
    const filters = (req as any).validatedQuery || req.query;
    const result = await getConversationMessages(req.user.userId, conversationId, filters);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    const message = error.message || "Failed to fetch messages";
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

export const sendMessageHandler = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const conversationId = req.params.conversationId as string;
    const message = await sendMessage(req.user.userId, conversationId, req.body);

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message
    });
  } catch (error: any) {
    const message = error.message || "Failed to send message";
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
