import { z } from "zod";

export const checkoutSchema = z.object({
  planType: z.enum(["ACTOR_PREMIUM", "CASTER_PREMIUM"], {
    message: "planType must be either ACTOR_PREMIUM or CASTER_PREMIUM"
  })
});

export const verifyPaymentSchema = z.object({
  orderId: z.string().trim().min(1, "Order ID is required"),
  paymentId: z.string().trim().min(1, "Payment ID is required"),
  signature: z.string().trim().min(1, "Payment signature is required")
});

export const billingHistoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20)
});
