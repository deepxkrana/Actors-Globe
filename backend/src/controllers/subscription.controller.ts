import type { Request, Response } from "express";
import * as subscriptionService from "../services/subscription.service.js";

export const getPlans = async (_req: Request, res: Response) => {
  try {
    const plans = await subscriptionService.getSubscriptionPlans();
    return res.status(200).json({
      success: true,
      data: plans
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve subscription plans"
    });
  }
};

export const getCurrentSubscription = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const entitlement = await subscriptionService.getUserSubscription(userId);
    return res.status(200).json({
      success: true,
      data: entitlement
    });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to retrieve current subscription"
    });
  }
};

export const createCheckout = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { planType } = req.body;
    const session = await subscriptionService.createCheckoutSession(userId, planType);

    return res.status(201).json({
      success: true,
      message: "Checkout session created successfully",
      data: session
    });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create checkout session"
    });
  }
};

export const verifyPayment = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { orderId, paymentId, signature } = req.body;
    const result = await subscriptionService.verifyAndActivatePayment(userId, {
      orderId,
      paymentId,
      signature
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified and subscription activated successfully",
      data: result
    });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to verify payment"
    });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const signature =
      (req.headers["x-razorpay-signature"] as string) ||
      (req.headers["x-signature"] as string) ||
      "";

    const rawBody = (req as any).rawBody || Buffer.from(JSON.stringify(req.body));

    const result = await subscriptionService.processWebhook(rawBody, signature, req.body);
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error: any) {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Webhook processing failed"
    });
  }
};

export const cancelSubscription = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const cancelled = await subscriptionService.cancelSubscription(userId);
    return res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully",
      data: cancelled
    });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to cancel subscription"
    });
  }
};

export const getBillingHistory = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const history = await subscriptionService.getUserBillingHistory(userId, {
      page,
      limit
    });

    return res.status(200).json({
      success: true,
      data: history.transactions,
      pagination: history.pagination
    });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to retrieve billing history"
    });
  }
};
