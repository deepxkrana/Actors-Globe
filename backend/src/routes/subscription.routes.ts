import { Router } from "express";
import {
  getPlans,
  getCurrentSubscription,
  createCheckout,
  verifyPayment,
  handleWebhook,
  cancelSubscription,
  getBillingHistory
} from "../controllers/subscription.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { validate, validateQuery } from "../middlewares/validate.js";
import {
  checkoutSchema,
  verifyPaymentSchema,
  billingHistoryQuerySchema
} from "../validators/subscription.validator.js";

const router = Router();

// Public plan catalog
router.get("/plans", getPlans);

// Authenticated current subscription and entitlement status
router.get("/current", authenticate, getCurrentSubscription);

// Create checkout session (order)
router.post(
  "/checkout",
  authenticate,
  validate(checkoutSchema),
  createCheckout
);

// Verify gateway payment signature and activate subscription
router.post(
  "/verify",
  authenticate,
  validate(verifyPaymentSchema),
  verifyPayment
);

// Payment provider webhook endpoint (idempotent, server-to-server)
router.post("/webhook", handleWebhook);

// Cancel active subscription
router.post("/cancel", authenticate, cancelSubscription);

// Retrieve billing transactions history
router.get(
  "/history",
  authenticate,
  validateQuery(billingHistoryQuerySchema),
  getBillingHistory
);

export default router;
