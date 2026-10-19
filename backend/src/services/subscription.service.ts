import prisma from "../config/prisma.js";
import { config } from "../config/env.js";
import {
  generateOrderId,
  verifyPaymentSignature,
  verifyWebhookSignature
} from "../utils/paymentGateway.js";
import type {
  PlanType,
  CheckoutSessionResult,
  VerifyPaymentInput,
  SubscriptionEntitlement
} from "../types/subscription.js";

/**
 * Seeds or updates the default subscription plans for Actors and Casters.
 */
export const ensureSubscriptionPlans = async () => {
  const actorPlan = await prisma.subscriptionPlan.upsert({
    where: { type: "ACTOR_PREMIUM" },
    update: {
      name: "Actor Premium",
      price: 149.0,
      durationDays: 30,
      isActive: true
    },
    create: {
      type: "ACTOR_PREMIUM",
      name: "Actor Premium",
      price: 149.0,
      durationDays: 30,
      isActive: true
    }
  });

  const casterPlan = await prisma.subscriptionPlan.upsert({
    where: { type: "CASTER_PREMIUM" },
    update: {
      name: "Caster Premium",
      price: 499.0,
      durationDays: 30,
      isActive: true
    },
    create: {
      type: "CASTER_PREMIUM",
      name: "Caster Premium",
      price: 499.0,
      durationDays: 30,
      isActive: true
    }
  });

  return { actorPlan, casterPlan };
};

/**
 * Retrieves all active subscription plans.
 */
export const getSubscriptionPlans = async () => {
  await ensureSubscriptionPlans();
  return prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" }
  });
};

/**
 * Reconciles expired subscriptions for a specific user.
 * If status is ACTIVE but endDate has passed, transitions to EXPIRED.
 */
export const reconcileUserSubscriptions = async (userId: string): Promise<void> => {
  const now = new Date();
  const expiredActive = await prisma.subscription.findMany({
    where: {
      userId,
      status: "ACTIVE",
      endDate: { lte: now }
    },
    include: { plan: true }
  });

  for (const sub of expiredActive) {
    await prisma.$transaction(async (tx: any) => {
      await tx.subscription.update({
        where: { id: sub.id },
        data: { status: "EXPIRED", autoRenew: false }
      });

      await tx.notification.create({
        data: {
          userId,
          type: "SUBSCRIPTION_EXPIRED",
          title: "Subscription Expired",
          message: `Your ${sub.plan.name} subscription has expired. Please renew to keep premium features.`,
          referenceId: sub.id
        }
      });
    });
  }
};

/**
 * Retrieves the user's current subscription state and entitlements.
 */
export const getUserSubscription = async (userId: string): Promise<SubscriptionEntitlement> => {
  await ensureSubscriptionPlans();
  await reconcileUserSubscriptions(userId);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });

  if (!user) {
    throw new Error("User not found");
  }

  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      endDate: { gt: new Date() }
    },
    include: { plan: true },
    orderBy: { endDate: "desc" }
  });

  if (activeSubscription) {
    const now = new Date().getTime();
    const end = new Date(activeSubscription.endDate).getTime();
    const daysRemaining = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));

    return {
      isPremium: true,
      role: user.role,
      planType: activeSubscription.plan.type as PlanType,
      status: "ACTIVE",
      startDate: activeSubscription.startDate,
      endDate: activeSubscription.endDate,
      autoRenew: activeSubscription.autoRenew,
      daysRemaining
    };
  }

  // Check if there was a previously expired or cancelled subscription
  const latestSubscription = await prisma.subscription.findFirst({
    where: { userId },
    include: { plan: true },
    orderBy: { updatedAt: "desc" }
  });

  return {
    isPremium: false,
    role: user.role,
    planType: (latestSubscription?.plan.type as PlanType) || null,
    status: (latestSubscription?.status as "EXPIRED" | "CANCELLED") || "NONE",
    startDate: latestSubscription?.startDate || null,
    endDate: latestSubscription?.endDate || null,
    autoRenew: false,
    daysRemaining: 0
  };
};

/**
 * Checks if a caster user has an active premium subscription.
 */
export const isCasterPremium = async (userId: string): Promise<boolean> => {
  await reconcileUserSubscriptions(userId);

  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      endDate: { gt: new Date() },
      plan: {
        type: "CASTER_PREMIUM"
      }
    }
  });

  return !!activeSubscription;
};

/**
 * Checks if an actor user has an active premium subscription.
 */
export const isActorPremium = async (userId: string): Promise<boolean> => {
  await reconcileUserSubscriptions(userId);

  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      endDate: { gt: new Date() },
      plan: {
        type: "ACTOR_PREMIUM"
      }
    }
  });

  return !!activeSubscription;
};

/**
 * Creates a server-side checkout session and records a PENDING PaymentTransaction.
 */
export const createCheckoutSession = async (
  userId: string,
  planType: PlanType
): Promise<CheckoutSessionResult> => {
  await ensureSubscriptionPlans();
  await reconcileUserSubscriptions(userId);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, email: true }
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Role validation: actors cannot buy caster plans and vice versa
  if (user.role === "ACTOR" && planType !== "ACTOR_PREMIUM") {
    const error: any = new Error("Actors can only subscribe to Actor Premium plans.");
    error.statusCode = 403;
    throw error;
  }

  if (user.role === "CASTER" && planType !== "CASTER_PREMIUM") {
    const error: any = new Error("Casters can only subscribe to Caster Premium plans.");
    error.statusCode = 403;
    throw error;
  }

  // Check for already active subscription of this plan
  const existingActive = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      endDate: { gt: new Date() },
      plan: { type: planType }
    }
  });

  if (existingActive) {
    const error: any = new Error("You already have an active subscription for this plan.");
    error.statusCode = 400;
    throw error;
  }

  const plan = await prisma.subscriptionPlan.findUnique({
    where: { type: planType }
  });

  if (!plan) {
    const error: any = new Error(`Subscription plan ${planType} not found.`);
    error.statusCode = 404;
    throw error;
  }

  const orderId = generateOrderId();

  await prisma.paymentTransaction.create({
    data: {
      userId,
      planId: plan.id,
      amount: plan.price,
      currency: "INR",
      status: "PENDING",
      provider: "RAZORPAY",
      orderId
    }
  });

  return {
    orderId,
    amount: Number(plan.price),
    currency: "INR",
    planType,
    planName: plan.name,
    durationDays: plan.durationDays,
    keyId: config.paymentKeyId
  };
};

/**
 * Authoritatively verifies payment gateway signature and activates subscription transactionally.
 */
export const verifyAndActivatePayment = async (
  userId: string,
  input: VerifyPaymentInput
) => {
  const transaction = await prisma.paymentTransaction.findUnique({
    where: { orderId: input.orderId },
    include: { plan: true }
  });

  if (!transaction) {
    const error: any = new Error("Payment order not found.");
    error.statusCode = 404;
    throw error;
  }

  if (transaction.userId !== userId) {
    const error: any = new Error("Unauthorized: this order does not belong to your account.");
    error.statusCode = 403;
    throw error;
  }

  // Idempotency: if already SUCCESS, return existing subscription
  if (transaction.status === "SUCCESS") {
    const existingSub = transaction.subscriptionId
      ? await prisma.subscription.findUnique({
          where: { id: transaction.subscriptionId },
          include: { plan: true }
        })
      : null;

    return {
      success: true,
      alreadyProcessed: true,
      subscription: existingSub
    };
  }

  // Authoritative cryptographic signature verification
  const isValidSignature = verifyPaymentSignature(input);

  if (!isValidSignature) {
    await prisma.paymentTransaction.update({
      where: { id: transaction.id },
      data: {
        status: "FAILED",
        paymentId: input.paymentId,
        signature: input.signature
      }
    });

    const error: any = new Error("Invalid payment signature verification failed.");
    error.statusCode = 400;
    throw error;
  }

  // Transactional activation
  return await prisma.$transaction(async (tx: any) => {
    // 1. Deactivate any prior active subscriptions for this user
    await tx.subscription.updateMany({
      where: {
        userId,
        status: "ACTIVE"
      },
      data: {
        status: "CANCELLED",
        autoRenew: false
      }
    });

    // 2. Create the new active subscription
    const startDate = new Date();
    const endDate = new Date(
      startDate.getTime() + transaction.plan.durationDays * 24 * 60 * 60 * 1000
    );

    const subscription = await tx.subscription.create({
      data: {
        userId,
        planId: transaction.planId,
        status: "ACTIVE",
        startDate,
        endDate,
        autoRenew: false
      },
      include: {
        plan: true
      }
    });

    // 3. Mark the transaction SUCCESS and link the subscription
    await tx.paymentTransaction.update({
      where: { id: transaction.id },
      data: {
        status: "SUCCESS",
        paymentId: input.paymentId,
        signature: input.signature,
        subscriptionId: subscription.id
      }
    });

    // 4. Create in-app payment success notification
    await tx.notification.create({
      data: {
        userId,
        type: "PAYMENT_SUCCESS",
        title: "Subscription Activated",
        message: `Your payment for ${transaction.plan.name} was successful. Premium access is now active!`,
        referenceId: subscription.id
      }
    });

    return {
      success: true,
      alreadyProcessed: false,
      subscription
    };
  });
};

/**
 * Idempotently processes payment provider webhooks with raw body signature verification.
 */
export const processWebhook = async (
  rawBody: string | Buffer,
  signature: string,
  payload: any
) => {
  // Authoritative webhook signature check
  const isValid = verifyWebhookSignature(rawBody, signature);
  if (!isValid) {
    const error: any = new Error("Invalid webhook signature.");
    error.statusCode = 400;
    throw error;
  }

  const event = payload?.event;

  // Handle successful payment events
  if (event === "payment.captured" || event === "order.paid") {
    const paymentEntity = payload?.payload?.payment?.entity;
    const orderEntity = payload?.payload?.order?.entity;

    const orderId = paymentEntity?.order_id || orderEntity?.id || payload?.orderId;
    const paymentId = paymentEntity?.id || payload?.paymentId;

    if (!orderId) {
      return { received: true, ignored: true, reason: "No order ID found in payload" };
    }

    const transaction = await prisma.paymentTransaction.findUnique({
      where: { orderId },
      include: { plan: true }
    });

    if (!transaction) {
      return { received: true, ignored: true, reason: "Transaction not found for orderId" };
    }

    // Idempotent webhook check: if already processed, do not duplicate
    if (transaction.status === "SUCCESS") {
      return { received: true, alreadyProcessed: true };
    }

    // Transactionally activate subscription
    await prisma.$transaction(async (tx: any) => {
      await tx.subscription.updateMany({
        where: {
          userId: transaction.userId,
          status: "ACTIVE"
        },
        data: {
          status: "CANCELLED",
          autoRenew: false
        }
      });

      const startDate = new Date();
      const endDate = new Date(
        startDate.getTime() + transaction.plan.durationDays * 24 * 60 * 60 * 1000
      );

      const subscription = await tx.subscription.create({
        data: {
          userId: transaction.userId,
          planId: transaction.planId,
          status: "ACTIVE",
          startDate,
          endDate,
          autoRenew: false
        }
      });

      await tx.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          status: "SUCCESS",
          paymentId: paymentId || `pay_webhook_${Date.now()}`,
          subscriptionId: subscription.id,
          metadata: payload
        }
      });

      await tx.notification.create({
        data: {
          userId: transaction.userId,
          type: "PAYMENT_SUCCESS",
          title: "Subscription Activated",
          message: `Your payment for ${transaction.plan.name} was successfully captured via webhook. Premium access is active!`,
          referenceId: subscription.id
        }
      });
    });

    return { received: true, processed: true };
  }

  // Handle failed payment events
  if (event === "payment.failed") {
    const paymentEntity = payload?.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id || payload?.orderId;

    if (orderId) {
      const transaction = await prisma.paymentTransaction.findUnique({
        where: { orderId }
      });

      if (transaction && transaction.status === "PENDING") {
        await prisma.paymentTransaction.update({
          where: { id: transaction.id },
          data: {
            status: "FAILED",
            metadata: payload
          }
        });
      }
    }

    return { received: true, markedFailed: true };
  }

  return { received: true, unhandled: event };
};

/**
 * Cancels a user's active subscription.
 */
export const cancelSubscription = async (userId: string) => {
  await reconcileUserSubscriptions(userId);

  const activeSub = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      endDate: { gt: new Date() }
    },
    include: { plan: true }
  });

  if (!activeSub) {
    const error: any = new Error("No active subscription found to cancel.");
    error.statusCode = 404;
    throw error;
  }

  const cancelled = await prisma.$transaction(async (tx: any) => {
    const updated = await tx.subscription.update({
      where: { id: activeSub.id },
      data: {
        status: "CANCELLED",
        autoRenew: false
      },
      include: { plan: true }
    });

    await tx.notification.create({
      data: {
        userId,
        type: "GENERAL",
        title: "Subscription Cancelled",
        message: `Your subscription to ${activeSub.plan.name} has been cancelled.`,
        referenceId: activeSub.id
      }
    });

    return updated;
  });

  return cancelled;
};

/**
 * Retrieves the billing transaction history for the authenticated user.
 */
export const getUserBillingHistory = async (
  userId: string,
  pagination: { page: number; limit: number }
) => {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  const [total, transactions] = await Promise.all([
    prisma.paymentTransaction.count({
      where: { userId }
    }),
    prisma.paymentTransaction.findMany({
      where: { userId },
      include: {
        plan: {
          select: {
            id: true,
            type: true,
            name: true,
            price: true,
            durationDays: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    })
  ]);

  return {
    transactions,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Helper used in testing fixtures to grant a plan directly.
 */
export const grantSubscription = async (
  userId: string,
  planType: PlanType,
  durationDays = 30
) => {
  await ensureSubscriptionPlans();

  const plan = await prisma.subscriptionPlan.findUnique({
    where: { type: planType }
  });

  if (!plan) {
    throw new Error(`Subscription plan ${planType} not found`);
  }

  // Deactivate any currently active subscriptions for this user
  await prisma.subscription.updateMany({
    where: {
      userId,
      status: "ACTIVE"
    },
    data: {
      status: "CANCELLED",
      autoRenew: false
    }
  });

  const startDate = new Date();
  const endDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

  const subscription = await prisma.subscription.create({
    data: {
      userId,
      planId: plan.id,
      status: "ACTIVE",
      startDate,
      endDate,
      autoRenew: false
    },
    include: {
      plan: true
    }
  });

  return subscription;
};
