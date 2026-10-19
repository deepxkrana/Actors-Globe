export type PlanType = "ACTOR_PREMIUM" | "CASTER_PREMIUM";

export interface CheckoutSessionResult {
  orderId: string;
  amount: number;
  currency: string;
  planType: PlanType;
  planName: string;
  durationDays: number;
  keyId: string;
}

export interface VerifyPaymentInput {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface WebhookEventPayload {
  event: string;
  payload: {
    payment?: {
      entity: {
        id: string;
        order_id: string;
        amount: number;
        currency: string;
        status: string;
        [key: string]: any;
      };
    };
    order?: {
      entity: {
        id: string;
        amount: number;
        currency: string;
        status: string;
        [key: string]: any;
      };
    };
    [key: string]: any;
  };
  [key: string]: any;
}

export interface SubscriptionEntitlement {
  isPremium: boolean;
  role: "ACTOR" | "CASTER";
  planType: PlanType | null;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED" | "NONE";
  startDate: Date | null;
  endDate: Date | null;
  autoRenew: boolean;
  daysRemaining: number;
}
