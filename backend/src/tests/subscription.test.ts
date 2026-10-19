import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../app.js";
import prisma from "../config/prisma.js";
import {
  generatePaymentSignature,
  generateWebhookSignature
} from "../utils/paymentGateway.js";

process.env.NODE_ENV = "test";

describe("Subscriptions and Payments Phase 9 Tests", () => {
  const timestamp = Date.now();

  const actorUser = {
    name: "Sub Actor",
    email: `sub_actor_${timestamp}@example.com`,
    phone: `6${Math.floor(100000000 + Math.random() * 900000000)}`,
    password: "Password123!",
    role: "ACTOR" as const
  };

  const rivalActorUser = {
    name: "Rival Sub Actor",
    email: `sub_rival_actor_${timestamp}@example.com`,
    phone: `5${Math.floor(100000000 + Math.random() * 900000000)}`,
    password: "Password123!",
    role: "ACTOR" as const
  };

  const casterUser = {
    name: "Sub Caster",
    email: `sub_caster_${timestamp}@example.com`,
    phone: `4${Math.floor(100000000 + Math.random() * 900000000)}`,
    password: "Password123!",
    role: "CASTER" as const
  };

  let actorToken = "";
  let actorUserId = "";
  let rivalActorToken = "";
  let rivalActorUserId = "";
  let casterToken = "";
  let casterUserId = "";

  before(async () => {
    // 1. Register users
    const aRes = await request(app).post("/api/auth/register").send(actorUser);
    actorToken = aRes.body.token;
    actorUserId = aRes.body.user.id;

    const rRes = await request(app).post("/api/auth/register").send(rivalActorUser);
    rivalActorToken = rRes.body.token;
    rivalActorUserId = rRes.body.user.id;

    const cRes = await request(app).post("/api/auth/register").send(casterUser);
    casterToken = cRes.body.token;
    casterUserId = cRes.body.user.id;
  });

  after(async () => {
    // Cleanup created test records
    await prisma.notification.deleteMany({
      where: { userId: { in: [actorUserId, rivalActorUserId, casterUserId] } }
    });
    await prisma.paymentTransaction.deleteMany({
      where: { userId: { in: [actorUserId, rivalActorUserId, casterUserId] } }
    });
    await prisma.subscription.deleteMany({
      where: { userId: { in: [actorUserId, rivalActorUserId, casterUserId] } }
    });
    await prisma.verificationChallenge.deleteMany({
      where: { userId: { in: [actorUserId, rivalActorUserId, casterUserId] } }
    });
    await prisma.user.deleteMany({
      where: { id: { in: [actorUserId, rivalActorUserId, casterUserId] } }
    });
  });

  describe("Subscription Plan Catalog", () => {
    test("GET /api/subscriptions/plans returns active plans with accurate pricing", async () => {
      const res = await request(app).get("/api/subscriptions/plans");

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));

      const actorPlan = res.body.data.find(
        (p: any) => p.type === "ACTOR_PREMIUM"
      );
      assert.ok(actorPlan);
      assert.equal(actorPlan.name, "Actor Premium");
      assert.equal(Number(actorPlan.price), 149);

      const casterPlan = res.body.data.find(
        (p: any) => p.type === "CASTER_PREMIUM"
      );
      assert.ok(casterPlan);
      assert.equal(casterPlan.name, "Caster Premium");
      assert.equal(Number(casterPlan.price), 499);
    });
  });

  describe("Current Subscription Status & Entitlement Reconciliation", () => {
    test("returns isPremium: false and status: NONE for unsubscribed user", async () => {
      const res = await request(app)
        .get("/api/subscriptions/current")
        .set("Authorization", `Bearer ${actorToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.isPremium, false);
      assert.equal(res.body.data.status, "NONE");
      assert.equal(res.body.data.role, "ACTOR");
      assert.equal(res.body.data.daysRemaining, 0);
    });

    test("automatically transitions expired subscription to EXPIRED status", async () => {
      // Find actor plan
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { type: "ACTOR_PREMIUM" }
      });
      assert.ok(plan);

      // Create an expired subscription manually (endDate in the past)
      const pastStart = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000);
      const pastEnd = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

      await prisma.subscription.create({
        data: {
          userId: actorUserId,
          planId: plan.id,
          status: "ACTIVE", // intentionally ACTIVE to test reconciliation
          startDate: pastStart,
          endDate: pastEnd,
          autoRenew: false
        }
      });

      // Calling /current should reconcile and update status to EXPIRED
      const res = await request(app)
        .get("/api/subscriptions/current")
        .set("Authorization", `Bearer ${actorToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.data.isPremium, false);
      assert.equal(res.body.data.status, "EXPIRED");

      // Verify database updated
      const dbSub = await prisma.subscription.findFirst({
        where: { userId: actorUserId, planId: plan.id }
      });
      assert.equal(dbSub?.status, "EXPIRED");
    });
  });

  describe("Role Boundaries & Checkout Session Creation", () => {
    test("blocks ACTOR from checking out CASTER_PREMIUM with 403 Forbidden", async () => {
      const res = await request(app)
        .post("/api/subscriptions/checkout")
        .set("Authorization", `Bearer ${actorToken}`)
        .send({ planType: "CASTER_PREMIUM" });

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /Actors can only subscribe to Actor Premium/);
    });

    test("blocks CASTER from checking out ACTOR_PREMIUM with 403 Forbidden", async () => {
      const res = await request(app)
        .post("/api/subscriptions/checkout")
        .set("Authorization", `Bearer ${casterToken}`)
        .send({ planType: "ACTOR_PREMIUM" });

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /Casters can only subscribe to Caster Premium/);
    });

    test("creates checkout session and PENDING transaction for valid role", async () => {
      const res = await request(app)
        .post("/api/subscriptions/checkout")
        .set("Authorization", `Bearer ${actorToken}`)
        .send({ planType: "ACTOR_PREMIUM" });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.orderId);
      assert.equal(res.body.data.amount, 149);
      assert.equal(res.body.data.currency, "INR");
      assert.equal(res.body.data.planType, "ACTOR_PREMIUM");

      // Verify transaction in database
      const tx = await prisma.paymentTransaction.findUnique({
        where: { orderId: res.body.data.orderId }
      });
      assert.ok(tx);
      assert.equal(tx.status, "PENDING");
      assert.equal(tx.userId, actorUserId);
    });
  });

  describe("Cryptographic Signature Verification & Activation", () => {
    let orderId = "";
    const paymentId = "pay_test_signature_123";

    before(async () => {
      const checkoutRes = await request(app)
        .post("/api/subscriptions/checkout")
        .set("Authorization", `Bearer ${actorToken}`)
        .send({ planType: "ACTOR_PREMIUM" });
      orderId = checkoutRes.body.data.orderId;
    });

    test("rejects forged / invalid signature with 400 Bad Request and marks transaction FAILED", async () => {
      const res = await request(app)
        .post("/api/subscriptions/verify")
        .set("Authorization", `Bearer ${actorToken}`)
        .send({
          orderId,
          paymentId,
          signature: "forged_invalid_hex_signature_abc123"
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /Invalid payment signature/);

      // Verify transaction updated to FAILED
      const tx = await prisma.paymentTransaction.findUnique({
        where: { orderId }
      });
      assert.equal(tx?.status, "FAILED");
    });

    test("blocks another user from verifying someone else's order with 403 Forbidden", async () => {
      // Create fresh order for actor
      const checkout = await request(app)
        .post("/api/subscriptions/checkout")
        .set("Authorization", `Bearer ${actorToken}`)
        .send({ planType: "ACTOR_PREMIUM" });

      const actorOrderId = checkout.body.data.orderId;
      const validSig = generatePaymentSignature(actorOrderId, paymentId);

      // Rival actor attempts to verify actor's order
      const res = await request(app)
        .post("/api/subscriptions/verify")
        .set("Authorization", `Bearer ${rivalActorToken}`)
        .send({
          orderId: actorOrderId,
          paymentId,
          signature: validSig
        });

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /Unauthorized: this order does not belong to your account/);
    });

    test("verifies valid HMAC-SHA256 signature, activates subscription, and creates notification", async () => {
      // Create new checkout order
      const checkout = await request(app)
        .post("/api/subscriptions/checkout")
        .set("Authorization", `Bearer ${actorToken}`)
        .send({ planType: "ACTOR_PREMIUM" });

      const validOrderId = checkout.body.data.orderId;
      const validSig = generatePaymentSignature(validOrderId, paymentId);

      const res = await request(app)
        .post("/api/subscriptions/verify")
        .set("Authorization", `Bearer ${actorToken}`)
        .send({
          orderId: validOrderId,
          paymentId,
          signature: validSig
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.subscription);
      assert.equal(res.body.data.subscription.status, "ACTIVE");

      // Verify transaction status in database is SUCCESS
      const tx = await prisma.paymentTransaction.findUnique({
        where: { orderId: validOrderId }
      });
      assert.equal(tx?.status, "SUCCESS");
      assert.equal(tx?.paymentId, paymentId);

      // Verify notification created
      const notif = await prisma.notification.findFirst({
        where: { userId: actorUserId, type: "PAYMENT_SUCCESS" },
        orderBy: { createdAt: "desc" }
      });
      assert.ok(notif);
      assert.match(notif.title, /Subscription Activated/);

      // Verify /current returns premium
      const currentRes = await request(app)
        .get("/api/subscriptions/current")
        .set("Authorization", `Bearer ${actorToken}`);

      assert.equal(currentRes.body.data.isPremium, true);
      assert.equal(currentRes.body.data.status, "ACTIVE");
      assert.ok(currentRes.body.data.daysRemaining > 0);
    });

    test("idempotently handles duplicate verification requests without duplicating subscription", async () => {
      // Find the existing successful transaction
      const tx = await prisma.paymentTransaction.findFirst({
        where: { userId: actorUserId, status: "SUCCESS" }
      });
      assert.ok(tx);

      const validSig = generatePaymentSignature(tx.orderId, tx.paymentId!);

      const res = await request(app)
        .post("/api/subscriptions/verify")
        .set("Authorization", `Bearer ${actorToken}`)
        .send({
          orderId: tx.orderId,
          paymentId: tx.paymentId!,
          signature: validSig
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.data.alreadyProcessed, true);

      // Verify count of active subscriptions for user is strictly 1
      const activeCount = await prisma.subscription.count({
        where: { userId: actorUserId, status: "ACTIVE" }
      });
      assert.equal(activeCount, 1);
    });

    test("blocks creating duplicate checkout if user already has an active subscription for plan", async () => {
      const res = await request(app)
        .post("/api/subscriptions/checkout")
        .set("Authorization", `Bearer ${actorToken}`)
        .send({ planType: "ACTOR_PREMIUM" });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /already have an active subscription/);
    });
  });

  describe("Payment Provider Webhook Verification & Idempotency", () => {
    let webhookOrderId = "";
    const webhookPaymentId = "pay_webhook_event_456";

    before(async () => {
      // Create pending order for caster
      const checkout = await request(app)
        .post("/api/subscriptions/checkout")
        .set("Authorization", `Bearer ${casterToken}`)
        .send({ planType: "CASTER_PREMIUM" });
      webhookOrderId = checkout.body.data.orderId;
    });

    test("rejects webhook request with invalid signature with 400 Bad Request", async () => {
      const payload = {
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: webhookPaymentId,
              order_id: webhookOrderId,
              amount: 49900,
              currency: "INR"
            }
          }
        }
      };

      const res = await request(app)
        .post("/api/subscriptions/webhook")
        .set("x-razorpay-signature", "invalid_forged_webhook_signature")
        .send(payload);

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /Invalid webhook signature/);
    });

    test("processes valid payment.captured webhook, activates subscription, and updates transaction", async () => {
      const payload = {
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: webhookPaymentId,
              order_id: webhookOrderId,
              amount: 49900,
              currency: "INR"
            }
          }
        }
      };

      const rawBody = JSON.stringify(payload);
      const signature = generateWebhookSignature(rawBody);

      const res = await request(app)
        .post("/api/subscriptions/webhook")
        .set("Content-Type", "application/json")
        .set("x-razorpay-signature", signature)
        .send(rawBody);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.processed, true);

      // Verify caster is now active premium
      const currentRes = await request(app)
        .get("/api/subscriptions/current")
        .set("Authorization", `Bearer ${casterToken}`);

      assert.equal(currentRes.body.data.isPremium, true);
      assert.equal(currentRes.body.data.status, "ACTIVE");
      assert.equal(currentRes.body.data.planType, "CASTER_PREMIUM");
    });

    test("idempotently ignores replayed webhook delivery without duplicate activation", async () => {
      const payload = {
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: webhookPaymentId,
              order_id: webhookOrderId,
              amount: 49900,
              currency: "INR"
            }
          }
        }
      };

      const rawBody = JSON.stringify(payload);
      const signature = generateWebhookSignature(rawBody);

      const res = await request(app)
        .post("/api/subscriptions/webhook")
        .set("Content-Type", "application/json")
        .set("x-razorpay-signature", signature)
        .send(rawBody);

      assert.equal(res.status, 200);
      assert.equal(res.body.alreadyProcessed, true);

      // Active subscriptions for caster should still be 1
      const count = await prisma.subscription.count({
        where: { userId: casterUserId, status: "ACTIVE" }
      });
      assert.equal(count, 1);
    });

    test("processes payment.failed webhook and marks pending transaction FAILED", async () => {
      // Create new pending order
      const failedCheckout = await request(app)
        .post("/api/subscriptions/checkout")
        .set("Authorization", `Bearer ${rivalActorToken}`)
        .send({ planType: "ACTOR_PREMIUM" });

      const failedOrderId = failedCheckout.body.data.orderId;

      const payload = {
        event: "payment.failed",
        payload: {
          payment: {
            entity: {
              id: "pay_failed_123",
              order_id: failedOrderId,
              error_code: "BAD_REQUEST_ERROR"
            }
          }
        }
      };

      const rawBody = JSON.stringify(payload);
      const signature = generateWebhookSignature(rawBody);

      const res = await request(app)
        .post("/api/subscriptions/webhook")
        .set("Content-Type", "application/json")
        .set("x-razorpay-signature", signature)
        .send(rawBody);

      assert.equal(res.status, 200);
      assert.equal(res.body.markedFailed, true);

      // Verify transaction marked FAILED
      const tx = await prisma.paymentTransaction.findUnique({
        where: { orderId: failedOrderId }
      });
      assert.equal(tx?.status, "FAILED");
    });
  });

  describe("Subscription Cancellation Workflow", () => {
    test("authenticated subscriber cancels their active subscription", async () => {
      const res = await request(app)
        .post("/api/subscriptions/cancel")
        .set("Authorization", `Bearer ${actorToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.status, "CANCELLED");
      assert.equal(res.body.data.autoRenew, false);

      // Verify /current reflects non-premium
      const currentRes = await request(app)
        .get("/api/subscriptions/current")
        .set("Authorization", `Bearer ${actorToken}`);

      assert.equal(currentRes.body.data.isPremium, false);
      assert.equal(currentRes.body.data.status, "CANCELLED");
    });

    test("cancel returns 404 Not Found when no active subscription exists", async () => {
      const res = await request(app)
        .post("/api/subscriptions/cancel")
        .set("Authorization", `Bearer ${actorToken}`);

      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /No active subscription found/);
    });
  });

  describe("Billing History and Transaction Listing", () => {
    test("GET /api/subscriptions/history returns user transaction records and pagination", async () => {
      const res = await request(app)
        .get("/api/subscriptions/history?page=1&limit=10")
        .set("Authorization", `Bearer ${actorToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.pagination);
      assert.equal(res.body.pagination.page, 1);
      assert.equal(res.body.pagination.limit, 10);
      assert.ok(res.body.pagination.total >= 1);

      const firstTx = res.body.data[0];
      assert.ok(firstTx.orderId);
      assert.ok(firstTx.status);
      assert.ok(firstTx.amount);
      assert.ok(firstTx.plan);
    });
  });
});
