import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../app.js";
import prisma from "../config/prisma.js";
import { authorizeRole, authenticate } from "../middlewares/auth.js";
import { Router } from "express";

// Set test environment
process.env.NODE_ENV = "test";

// Add a test-only route to test role-based authorization
const testRouter = Router();
testRouter.get("/actor-only", authenticate, authorizeRole("ACTOR"), (_req, res) => {
  res.status(200).json({ success: true, message: "Welcome Actor" });
});
testRouter.get("/caster-only", authenticate, authorizeRole("CASTER"), (_req, res) => {
  res.status(200).json({ success: true, message: "Welcome Caster" });
});
app.use("/api/test-roles", testRouter);

describe("Authentication & Authorization Phase 1 Tests", () => {
  const timestamp = Date.now();
  const testActor = {
    name: "Test Actor",
    email: `actor_${timestamp}@example.com`,
    phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
    password: "Password123!",
    role: "ACTOR" as const
  };

  const testCaster = {
    name: "Test Caster",
    email: `caster_${timestamp}@example.com`,
    phone: `8${Math.floor(100000000 + Math.random() * 900000000)}`,
    password: "CasterPassword123!",
    role: "CASTER" as const
  };

  let actorToken = "";
  let actorCookie = "";
  let casterToken = "";

  after(async () => {
    // Cleanup created test users
    try {
      await prisma.user.deleteMany({
        where: {
          email: {
            in: [testActor.email.toLowerCase(), testCaster.email.toLowerCase()]
          }
        }
      });
      await prisma.$disconnect();
    } catch {
      // Ignore cleanup error in test tear-down
    }
  });

  describe("Input Validation", () => {
    test("rejects registration with invalid email", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Invalid Email",
          email: "not-an-email",
          phone: "9876543210",
          password: "Password123!",
          role: "ACTOR"
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.errors);
    });

    test("rejects registration with invalid phone (not 10 digits)", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Invalid Phone",
          email: "valid@example.com",
          phone: "123", // only 3 digits
          password: "Password123!",
          role: "ACTOR"
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
    });

    test("rejects registration with short password (< 8 chars)", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Short Pass",
          email: "valid@example.com",
          phone: "9876543210",
          password: "short",
          role: "ACTOR"
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
    });

    test("rejects registration with invalid role (e.g. ADMIN)", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Admin Attempter",
          email: "admin_attempt@example.com",
          phone: "9876543210",
          password: "Password123!",
          role: "ADMIN"
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
    });
  });

  describe("Registration Flow", () => {
    test("successfully registers actor and returns safe user & token & cookie", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send(testActor);

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.token);
      assert.strictEqual(res.body.user.email, testActor.email.toLowerCase());
      assert.strictEqual(res.body.user.role, "ACTOR");
      assert.strictEqual(res.body.user.passwordHash, undefined);
      assert.strictEqual(res.body.user.password, undefined);

      actorToken = res.body.token;

      // Verify cookie
      const headerVal = res.headers["set-cookie"] as unknown as string[] | string | undefined;
      const cookies = Array.isArray(headerVal) ? headerVal : [headerVal || ""];
      assert.ok(cookies.some((c: string) => c.startsWith("token=")));
      actorCookie = cookies.find((c: string) => c.startsWith("token="))!;
    });

    test("successfully registers caster", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send(testCaster);

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.user.role, "CASTER");
      assert.strictEqual(res.body.user.passwordHash, undefined);

      casterToken = res.body.token;
    });

    test("rejects duplicate email registration with 409 Conflict", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          ...testActor,
          phone: `7${Math.floor(100000000 + Math.random() * 900000000)}`
        });

      assert.strictEqual(res.status, 409);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes("already exists"));
    });

    test("rejects duplicate phone registration with 409 Conflict", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          ...testActor,
          email: `different_${Date.now()}@example.com`
        });

      assert.strictEqual(res.status, 409);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes("already exists"));
    });
  });

  describe("Login Flow", () => {
    test("successfully logs in with valid credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: testActor.email,
          password: testActor.password
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.token);
      assert.strictEqual(res.body.user.id, res.body.user.id);
      assert.strictEqual(res.body.user.passwordHash, undefined);
    });

    test("handles case-insensitive email login", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: testActor.email.toUpperCase(),
          password: testActor.password
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
    });

    test("rejects login with incorrect password with 401 and generic error", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: testActor.email,
          password: "WrongPassword999!"
        });

      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, "Invalid email or password");
    });

    test("rejects login for nonexistent user with 401 and generic error", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent_user_99999@example.com",
          password: "SomePassword123!"
        });

      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, "Invalid email or password");
    });
  });

  describe("Current User (GET /api/auth/me)", () => {
    test("returns current user when authenticated via Authorization Bearer header", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${actorToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.user.email, testActor.email.toLowerCase());
      assert.strictEqual(res.body.user.passwordHash, undefined);
    });

    test("returns current user when authenticated via HttpOnly cookie", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Cookie", [actorCookie]);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.user.email, testActor.email.toLowerCase());
    });

    test("returns 401 when no token or cookie provided", async () => {
      const res = await request(app).get("/api/auth/me");

      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
    });

    test("returns 401 when token is invalid or tampered", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid.tampered.token");

      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
    });
  });

  describe("Logout Flow (POST /api/auth/logout)", () => {
    test("clears cookie and returns 200", async () => {
      const res = await request(app).post("/api/auth/logout");

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      const headerVal = res.headers["set-cookie"] as unknown as string[] | string | undefined;
      const cookies = Array.isArray(headerVal) ? headerVal : [headerVal || ""];
      assert.ok(cookies.some((c: string) => c.includes("token=;")));
    });
  });

  describe("Role-Based Authorization Foundations", () => {
    test("allows ACTOR to access actor-only endpoint", async () => {
      const res = await request(app)
        .get("/api/test-roles/actor-only")
        .set("Authorization", `Bearer ${actorToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.message, "Welcome Actor");
    });

    test("blocks CASTER from actor-only endpoint with 403 Forbidden", async () => {
      const res = await request(app)
        .get("/api/test-roles/actor-only")
        .set("Authorization", `Bearer ${casterToken}`);

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes("Forbidden"));
    });

    test("allows CASTER to access caster-only endpoint", async () => {
      const res = await request(app)
        .get("/api/test-roles/caster-only")
        .set("Authorization", `Bearer ${casterToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.message, "Welcome Caster");
    });

    test("blocks ACTOR from caster-only endpoint with 403 Forbidden", async () => {
      const res = await request(app)
        .get("/api/test-roles/caster-only")
        .set("Authorization", `Bearer ${actorToken}`);

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes("Forbidden"));
    });
  });
});
