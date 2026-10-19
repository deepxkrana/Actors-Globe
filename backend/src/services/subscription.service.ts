import prisma from "../config/prisma.js";

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

export const isCasterPremium = async (userId: string): Promise<boolean> => {
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

export const grantSubscription = async (
  userId: string,
  planType: "ACTOR_PREMIUM" | "CASTER_PREMIUM",
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
      status: "CANCELLED"
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
