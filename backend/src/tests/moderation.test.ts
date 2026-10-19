import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../app.js";
import prisma from "../config/prisma.js";
import { ensureAdminAccount } from "../services/admin.service.js";
import { grantSubscription } from "../services/subscription.service.js";

process.env.NODE_ENV = "test";

describe("Administration and Moderation Phase 10 Tests", () => {
  const timestamp = Date.now();

  const adminEmail = `admin_${timestamp}@actorsglobe.com`;
  const adminPassword = "AdminSecurePassword123!";

  const reporterUser = {
    name: "Reporter Actor",
    email: `reporter_${timestamp}@example.com`,
    phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
    password: "Password123!",
    role: "ACTOR" as const
  };

  const offendingCaster = {
    name: "Offending Caster",
    email: `offender_${timestamp}@example.com`,
    phone: `8${Math.floor(100000000 + Math.random() * 900000000)}`,
    password: "Password123!",
    role: "CASTER" as const
  };

  let adminId = "";
  let adminToken = "";
  let reporterToken = "";
  let reporterUserId = "";
  let offendingToken = "";
  let offendingUserId = "";
  let createdProjectId = "";
  let testReportId = "";

  before(async () => {
    // 1. Seed admin account
    const admin = await ensureAdminAccount("Moderator Admin", adminEmail, adminPassword);
    adminId = admin.id;

    // 2. Register normal users
    const rRes = await request(app).post("/api/auth/register").send(reporterUser);
    reporterToken = rRes.body.token;
    reporterUserId = rRes.body.user.id;

    const oRes = await request(app).post("/api/auth/register").send(offendingCaster);
    offendingToken = oRes.body.token;
    offendingUserId = oRes.body.user.id;

    // Create caster profile
    await request(app)
      .post("/api/profiles/caster")
      .set("Authorization", `Bearer ${offendingToken}`)
      .send({ displayName: "Offending Caster Studio" });

    // 3. Create a project under the offending caster
    await grantSubscription(offendingUserId, "CASTER_PREMIUM", 30);
    const projRes = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${offendingToken}`)
      .send({
        title: `Spam Project ${timestamp}`,
        description: "Misleading project description for report testing",
        projectType: "FEATURE_FILM",
        location: "Mumbai",
        roles: [
          {
            title: "Background Lead",
            description: "Test role",
            genderRequirement: "ANY",
            minAge: 18,
            maxAge: 40
          }
        ]
      });
    createdProjectId = projRes.body.project.id;
  });

  after(async () => {
    // Clean up test data
    await prisma.report.deleteMany({
      where: {
        OR: [
          { reporterId: reporterUserId },
          { reportedUserId: offendingUserId },
          { adminId }
        ]
      }
    });
    await prisma.castingRole.deleteMany({
      where: { projectId: createdProjectId }
    });
    await prisma.project.deleteMany({
      where: { id: createdProjectId }
    });
    await prisma.notification.deleteMany({
      where: { userId: { in: [reporterUserId, offendingUserId] } }
    });
    await prisma.subscription.deleteMany({
      where: { userId: offendingUserId }
    });
    await prisma.verificationChallenge.deleteMany({
      where: { userId: { in: [reporterUserId, offendingUserId] } }
    });
    await prisma.user.deleteMany({
      where: { id: { in: [reporterUserId, offendingUserId] } }
    });
    await prisma.admin.deleteMany({
      where: { id: adminId }
    });
  });

  describe("Admin Authentication & Boundary Isolation", () => {
    test("public registration does not accept ADMIN role", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Fake Admin",
          email: `fake_admin_${timestamp}@example.com`,
          phone: `7${Math.floor(100000000 + Math.random() * 900000000)}`,
          password: "Password123!",
          role: "ADMIN"
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /Validation failed/);
      assert.ok(res.body.errors.some((e: any) => e.path.includes("role")));
    });

    test("admin login with wrong password fails with 401 Unauthorized", async () => {
      const res = await request(app)
        .post("/api/admin/login")
        .send({
          email: adminEmail,
          password: "WrongPassword999!"
        });

      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /Invalid admin credentials/);
    });

    test("admin login with valid credentials succeeds and returns isolated admin JWT", async () => {
      const res = await request(app)
        .post("/api/admin/login")
        .send({
          email: adminEmail,
          password: adminPassword
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.token);
      assert.equal(res.body.data.admin.email, adminEmail.toLowerCase());
      adminToken = res.body.data.token;

      // Verify cookie set
      const cookies = res.headers["set-cookie"];
      assert.ok(cookies);
      assert.ok(cookies.some((c: string) => c.includes("adminToken=")));
    });

    test("blocks regular user JWT token from accessing admin routes with 403 Forbidden", async () => {
      const res = await request(app)
        .get("/api/admin/dashboard/stats")
        .set("Authorization", `Bearer ${reporterToken}`); // user token, not admin token

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /Invalid or unauthorized admin credentials/);
    });

    test("blocks unauthenticated access to admin routes with 401 Unauthorized", async () => {
      const res = await request(app).get("/api/admin/dashboard/stats");

      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /Admin authentication required/);
    });

    test("authenticated admin retrieves their own profile via GET /api/admin/me", async () => {
      const res = await request(app)
        .get("/api/admin/me")
        .set("Authorization", `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.id, adminId);
      assert.equal(res.body.data.email, adminEmail.toLowerCase());
    });
  });

  describe("Report Submission & Target Validation", () => {
    test("rejects reporting nonexistent target entity with 404 Not Found", async () => {
      const res = await request(app)
        .post("/api/reports")
        .set("Authorization", `Bearer ${reporterToken}`)
        .send({
          targetType: "PROJECT",
          targetId: "00000000-0000-0000-0000-000000000000",
          reason: "Spam content"
        });

      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /Reported project does not exist/);
    });

    test("blocks user from reporting their own account with 400 Bad Request", async () => {
      const res = await request(app)
        .post("/api/reports")
        .set("Authorization", `Bearer ${reporterToken}`)
        .send({
          targetType: "USER",
          targetId: reporterUserId,
          reason: "Self report test"
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /cannot submit a report against your own account/);
    });

    test("successfully submits report for a published project and links reported user", async () => {
      const res = await request(app)
        .post("/api/reports")
        .set("Authorization", `Bearer ${reporterToken}`)
        .send({
          targetType: "PROJECT",
          targetId: createdProjectId,
          reason: "Spam / Inappropriate Content",
          description: "This project has suspicious contact info."
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.id);
      assert.equal(res.body.data.targetType, "PROJECT");
      assert.equal(res.body.data.targetId, createdProjectId);
      assert.equal(res.body.data.reportedUserId, offendingUserId);
      assert.equal(res.body.data.status, "PENDING");

      testReportId = res.body.data.id;
    });

    test("blocks duplicate open report for the same target by the same reporter with 400 Bad Request", async () => {
      const res = await request(app)
        .post("/api/reports")
        .set("Authorization", `Bearer ${reporterToken}`)
        .send({
          targetType: "PROJECT",
          targetId: createdProjectId,
          reason: "Duplicate report attempt",
          description: "Trying to submit again"
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /already have an active report under review/);
    });

    test("reporter views their submitted reports via GET /api/reports/my-reports", async () => {
      const res = await request(app)
        .get("/api/reports/my-reports")
        .set("Authorization", `Bearer ${reporterToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.data.length >= 1);

      const found = res.body.data.find((r: any) => r.id === testReportId);
      assert.ok(found);
      assert.equal(found.targetType, "PROJECT");
      assert.equal(found.status, "PENDING");
    });
  });

  describe("Admin Moderation Dashboard & Triage", () => {
    test("GET /api/admin/dashboard/stats returns aggregate moderation metrics", async () => {
      const res = await request(app)
        .get("/api/admin/dashboard/stats")
        .set("Authorization", `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.totalReports >= 1);
      assert.ok(res.body.data.pendingReports >= 1);
      assert.ok(res.body.data.byTargetType);
      assert.ok(res.body.data.byTargetType.PROJECT >= 1);
      assert.ok(Array.isArray(res.body.data.recentReports));
    });

    test("GET /api/admin/reports lists reports with status and targetType filtering", async () => {
      // Filter by status=PENDING & targetType=PROJECT
      const res = await request(app)
        .get("/api/admin/reports?status=PENDING&targetType=PROJECT&page=1&limit=10")
        .set("Authorization", `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.data.length >= 1);

      const reportItem = res.body.data.find((r: any) => r.id === testReportId);
      assert.ok(reportItem);
      assert.equal(reportItem.reporter.email, reporterUser.email.toLowerCase());
      assert.equal(reportItem.reportedUser.email, offendingCaster.email.toLowerCase());
      assert.ok(res.body.pagination);
    });

    test("GET /api/admin/reports/:id returns detailed report and dynamically resolved target details", async () => {
      const res = await request(app)
        .get(`/api/admin/reports/${testReportId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.report.id, testReportId);
      assert.ok(res.body.data.report.reporter);
      assert.ok(res.body.data.report.reportedUser);

      // Verify dynamically fetched project entity
      assert.ok(res.body.data.targetDetails);
      assert.equal(res.body.data.targetDetails.id, createdProjectId);
      assert.match(res.body.data.targetDetails.title, /Spam Project/);
    });

    test("PATCH /api/admin/reports/:id/status updates status to UNDER_REVIEW", async () => {
      const res = await request(app)
        .patch(`/api/admin/reports/${testReportId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          status: "UNDER_REVIEW",
          resolutionNote: "Investigation opened by admin."
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.status, "UNDER_REVIEW");
      assert.equal(res.body.data.admin.id, adminId);
      assert.equal(res.body.data.resolutionNote, "Investigation opened by admin.");
    });

    test("PATCH /api/admin/reports/:id/status updates status to RESOLVED and notifies reporter", async () => {
      const res = await request(app)
        .patch(`/api/admin/reports/${testReportId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          status: "RESOLVED",
          resolutionNote: "Content reviewed. Offending user warned and project flagged."
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.status, "RESOLVED");

      // Verify notification sent to reporter
      const notif = await prisma.notification.findFirst({
        where: {
          userId: reporterUserId,
          referenceId: testReportId
        },
        orderBy: { createdAt: "desc" }
      });
      assert.ok(notif);
      assert.match(notif.title, /Report Status Updated/);
      assert.match(notif.message, /RESOLVED/);
    });
  });

  describe("User Moderation Enforcement & Account Suspension", () => {
    test("admin suspends offending user account via PATCH /api/admin/users/:id/moderation", async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${offendingUserId}/moderation`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          isActive: false,
          reason: "Violation of Terms: repeated posting of spam casting roles."
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.isActive, false);

      // Verify suspended user is now blocked from logging in with 403 Forbidden
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({
          email: offendingCaster.email,
          password: offendingCaster.password
        });

      assert.equal(loginRes.status, 403);
      assert.equal(loginRes.body.success, false);
      assert.match(loginRes.body.message, /deactivated/i);
    });

    test("admin reactivates user account", async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${offendingUserId}/moderation`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          isActive: true,
          reason: "User responded to warning and spam content was removed."
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.isActive, true);

      // User can now log in successfully again
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({
          email: offendingCaster.email,
          password: offendingCaster.password
        });

      assert.equal(loginRes.status, 200);
      assert.equal(loginRes.body.success, true);
      assert.ok(loginRes.body.token);
    });
  });
});
