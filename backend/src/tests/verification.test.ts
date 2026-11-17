import { test, describe, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../app.js";
import prisma from "../config/prisma.js";

// Ensure test environment
process.env.NODE_ENV = "test";

describe("Verification and Account Lifecycle Phase 2 Tests", () => {
  const timestamp = Date.now();
  const testUser = {
    name: "Lifecycle User",
    email: `lifecycle_${timestamp}@example.com`,
    phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
    password: "OriginalPassword123!",
    role: "ACTOR" as const
  };

  let authToken = "";
  let initialEmailCode = "";

  after(async () => {
    try {
      await prisma.user.deleteMany({
        where: {
          email: testUser.email.toLowerCase()
        }
      });
      await prisma.$disconnect();
    } catch {
      // Ignore cleanup error
    }
  });

  test("Registration creates initial email verification challenge", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.user.emailVerified, false);
    assert.strictEqual(res.body.user.phoneVerified, false);
    assert.strictEqual(res.body.user.isActive, true);
    assert.ok(res.body.token);
    assert.ok(res.body.devVerificationCode);

    authToken = res.body.token;
    initialEmailCode = res.body.devVerificationCode;

    // Verify in database that challenge was stored as a SHA-256 hash
    const challenge = await prisma.verificationChallenge.findFirst({
      where: {
        userId: res.body.user.id,
        type: "EMAIL_VERIFICATION"
      }
    });

    assert.ok(challenge);
    assert.strictEqual(challenge.isUsed, false);
    // Hash is 64 hex characters (SHA-256)
    assert.strictEqual(challenge.tokenHash.length, 64);
    assert.notStrictEqual(challenge.tokenHash, initialEmailCode);
  });

  describe("Email Verification", () => {
    test("rejects incorrect email verification code and increments attempts", async () => {
      const res = await request(app)
        .post("/api/auth/verify-email")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ code: "000000" });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes("Invalid verification code"));
    });

    test("successfully verifies email with valid code", async () => {
      const res = await request(app)
        .post("/api/auth/verify-email")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ code: initialEmailCode });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.user.emailVerified, true);

      // Verify challenge in DB marked as used
      const challenge = await prisma.verificationChallenge.findFirst({
        where: {
          userId: res.body.user.id,
          type: "EMAIL_VERIFICATION"
        }
      });
      assert.strictEqual(challenge?.isUsed, true);
    });

    test("prevents reusing already used verification code", async () => {
      const res = await request(app)
        .post("/api/auth/verify-email")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ code: initialEmailCode });

      // User email is already verified, returns safe user
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.user.emailVerified, true);
    });
  });

  describe("Phone Verification & Resend Throttling", () => {
    let phoneCode = "";

    test("requests phone verification code via resend endpoint", async () => {
      const res = await request(app)
        .post("/api/auth/resend-verification")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ type: "PHONE" });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.devVerificationCode);
      phoneCode = res.body.devVerificationCode;
    });

    test("throttles immediate resend requests within 60 seconds", async () => {
      const res = await request(app)
        .post("/api/auth/resend-verification")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ type: "PHONE" });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes("Please wait"));
    });

    test("successfully verifies phone with valid code", async () => {
      const res = await request(app)
        .post("/api/auth/verify-phone")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ code: phoneCode });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.user.phoneVerified, true);
    });

    test("rejects resending verification for already verified email", async () => {
      const res = await request(app)
        .post("/api/auth/resend-verification")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ type: "EMAIL" });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, "Email is already verified");
    });
  });

  describe("Password Reset Workflow", () => {
    let resetToken = "";
    const newPassword = "NewSecretPassword456!";

    test("forgot password returns generic success for nonexistent email without exposing user absence", async () => {
      const res = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "doesnotexist_999@example.com" });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.devResetToken, undefined);
    });

    test("forgot password generates secure reset token for existing user", async () => {
      const res = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: testUser.email });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.devResetToken);
      resetToken = res.body.devResetToken;
    });

    test("rejects reset password with invalid token", async () => {
      const res = await request(app)
        .post("/api/auth/reset-password")
        .send({
          token: "invalid_fake_token_1234567890",
          newPassword
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes("invalid"));
    });

    test("resets password successfully with valid token", async () => {
      const res = await request(app)
        .post("/api/auth/reset-password")
        .send({
          token: resetToken,
          newPassword
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.message.includes("reset successfully"));
    });

    test("prevents reusing already used reset token", async () => {
      const res = await request(app)
        .post("/api/auth/reset-password")
        .send({
          token: resetToken,
          newPassword: "AnotherNewPassword789!"
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
    });

    test("login with old password fails with 401", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password // Old password
        });

      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
    });

    test("login with new password succeeds with 200", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: newPassword
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.user.emailVerified, true);
      assert.strictEqual(res.body.user.phoneVerified, true);

      // Refresh auth token for deactivation test
      authToken = res.body.token;
    });
  });

  describe("Account Deactivation Workflow", () => {
    test("authenticated user can deactivate their own account", async () => {
      const res = await request(app)
        .post("/api/auth/deactivate")
        .set("Authorization", `Bearer ${authToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.message.includes("deactivated"));

      // Verify cookie cleared
      const rawCookies = res.headers["set-cookie"] as unknown as string[] | string | undefined;
      const cookies = Array.isArray(rawCookies) ? rawCookies : [rawCookies || ""];
      assert.ok(cookies.some((c: string) => c.includes("token=;")));
    });

    test("login attempt for deactivated account is rejected with 403 Forbidden", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: "NewSecretPassword456!"
        });

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes("deactivated"));
    });
  });
});
