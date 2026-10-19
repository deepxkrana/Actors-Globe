import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../app.js";
import prisma from "../config/prisma.js";
import { grantSubscription } from "../services/subscription.service.js";

process.env.NODE_ENV = "test";

describe("Projects and Casting Roles Phase 5 Tests", () => {
  const timestamp = Date.now();
  const casterUser = {
    name: "Project Caster",
    email: `proj_caster_${timestamp}@example.com`,
    phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
    password: "Password123!",
    role: "CASTER" as const
  };

  const secondCasterUser = {
    name: "Second Project Caster",
    email: `proj_caster2_${timestamp}@example.com`,
    phone: `8${Math.floor(100000000 + Math.random() * 900000000)}`,
    password: "Password123!",
    role: "CASTER" as const
  };

  const actorUser = {
    name: "Project Actor",
    email: `proj_actor_${timestamp}@example.com`,
    phone: `7${Math.floor(100000000 + Math.random() * 900000000)}`,
    password: "Password123!",
    role: "ACTOR" as const
  };

  let casterToken = "";
  let casterUserId = "";
  let secondCasterToken = "";
  let secondCasterUserId = "";
  let actorToken = "";

  let emptyDraftProjectId = "";
  let publishedProjectId = "";
  let createdRoleId = "";

  before(async () => {
    // 1. Register users
    const c1 = await request(app).post("/api/auth/register").send(casterUser);
    casterToken = c1.body.token;
    casterUserId = c1.body.user.id;

    const c2 = await request(app).post("/api/auth/register").send(secondCasterUser);
    secondCasterToken = c2.body.token;
    secondCasterUserId = c2.body.user.id;

    const a1 = await request(app).post("/api/auth/register").send(actorUser);
    actorToken = a1.body.token;

    // 2. Create caster profiles
    await request(app)
      .post("/api/profiles/caster")
      .set("Authorization", `Bearer ${casterToken}`)
      .send({ displayName: "Prime Casting Studio" });

    await request(app)
      .post("/api/profiles/caster")
      .set("Authorization", `Bearer ${secondCasterToken}`)
      .send({ displayName: "Rival Casting Co" });
  });

  after(async () => {
    try {
      await prisma.user.deleteMany({
        where: {
          email: {
            in: [
              casterUser.email.toLowerCase(),
              secondCasterUser.email.toLowerCase(),
              actorUser.email.toLowerCase()
            ]
          }
        }
      });
      await prisma.$disconnect();
    } catch {
      // Ignore cleanup error
    }
  });

  describe("Premium Caster Requirement for Project Creation", () => {
    test("blocks non-premium caster from creating a project with 403 Upgrade Required", async () => {
      const res = await request(app)
        .post("/api/projects")
        .set("Authorization", `Bearer ${casterToken}`)
        .send({
          title: "Blockbuster Feature",
          description: "High budget drama looking for leading and supporting talent.",
          projectType: "FEATURE_FILM",
          location: "Mumbai, India"
        });

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes("Upgrade required"));
    });

    test("blocks ACTOR from project creation route with 403 Forbidden", async () => {
      const res = await request(app)
        .post("/api/projects")
        .set("Authorization", `Bearer ${actorToken}`)
        .send({
          title: "Actor Project Attempt",
          description: "Actors cannot create projects.",
          projectType: "SHORT_FILM",
          location: "Delhi, India"
        });

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
    });

    test("premium caster creates project successfully after subscription entitlement", async () => {
      // Grant CASTER_PREMIUM subscription
      await grantSubscription(casterUserId, "CASTER_PREMIUM");

      const res = await request(app)
        .post("/api/projects")
        .set("Authorization", `Bearer ${casterToken}`)
        .send({
          title: "The Silent Echo",
          description: "An emotional mystery thriller set in the Himalayan mountains.",
          projectType: "FEATURE_FILM",
          location: "Himachal Pradesh, India",
          startDate: "2026-12-01",
          endDate: "2027-03-01",
          applicationDeadline: "2026-11-15"
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.project.title, "The Silent Echo");
      assert.strictEqual(res.body.project.status, "DRAFT");
      assert.strictEqual(res.body.project.castingRoles.length, 0);

      emptyDraftProjectId = res.body.project.id;
    });

    test("creates project and initial roles atomically via transaction", async () => {
      const res = await request(app)
        .post("/api/projects")
        .set("Authorization", `Bearer ${casterToken}`)
        .send({
          title: "Metropolis Chronicles",
          description: "Sci-fi dystopian web series exploring artificial intelligence.",
          projectType: "WEB_SERIES",
          location: "Bengaluru, India",
          roles: [
            {
              title: "Lead Detective",
              description: "Cybernetics detective investigating rogue systems.",
              genderRequirement: "ANY",
              minAge: 25,
              maxAge: 45
            }
          ]
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.project.status, "DRAFT");
      assert.strictEqual(res.body.project.castingRoles.length, 1);
      assert.strictEqual(res.body.project.castingRoles[0].title, "Lead Detective");

      publishedProjectId = res.body.project.id;
    });
  });

  describe("Casting Roles Management & Ownership", () => {
    test("caster adds role to an existing project", async () => {
      const res = await request(app)
        .post(`/api/projects/${emptyDraftProjectId}/roles`)
        .set("Authorization", `Bearer ${casterToken}`)
        .send({
          title: "Mountain Guide",
          description: "Experienced local mountaineer who guides the investigation.",
          genderRequirement: "MALE",
          minAge: 30,
          maxAge: 55
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.role.title, "Mountain Guide");
      assert.strictEqual(res.body.role.status, "OPEN");

      createdRoleId = res.body.role.id;
    });

    test("blocks another caster from adding role to first caster's project", async () => {
      const res = await request(app)
        .post(`/api/projects/${emptyDraftProjectId}/roles`)
        .set("Authorization", `Bearer ${secondCasterToken}`)
        .send({
          title: "Unauthorized Role",
          description: "Should be blocked by ownership check."
        });

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
    });

    test("caster updates casting role details", async () => {
      const res = await request(app)
        .put(`/api/projects/${emptyDraftProjectId}/roles/${createdRoleId}`)
        .set("Authorization", `Bearer ${casterToken}`)
        .send({
          title: "Senior Mountain Guide",
          minAge: 35
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.role.title, "Senior Mountain Guide");
      assert.strictEqual(res.body.role.minAge, 35);
    });
  });

  describe("Publishing Rules (Minimum 1 Role Requirement)", () => {
    test("rejects publishing project without casting roles with 400 Bad Request", async () => {
      // Create another empty draft project without roles
      const emptyRes = await request(app)
        .post("/api/projects")
        .set("Authorization", `Bearer ${casterToken}`)
        .send({
          title: "Empty Project",
          description: "A project created without any casting roles.",
          projectType: "SHORT_FILM",
          location: "Goa, India"
        });

      const emptyId = emptyRes.body.project.id;

      // Attempt to publish
      const pubRes = await request(app)
        .post(`/api/projects/${emptyId}/publish`)
        .set("Authorization", `Bearer ${casterToken}`);

      assert.strictEqual(pubRes.status, 400);
      assert.strictEqual(pubRes.body.success, false);
      assert.ok(pubRes.body.message.includes("at least one casting role"));
    });

    test("successfully publishes project having at least one role", async () => {
      const res = await request(app)
        .post(`/api/projects/${publishedProjectId}/publish`)
        .set("Authorization", `Bearer ${casterToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.project.status, "PUBLISHED");
    });
  });

  describe("Project Visibility & Listings", () => {
    test("public project listing returns only published projects", async () => {
      const res = await request(app).get("/api/projects");

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(Array.isArray(res.body.projects));
      // Must include publishedProjectId, must NOT include draft emptyDraftProjectId
      assert.ok(res.body.projects.some((p: any) => p.id === publishedProjectId));
      assert.strictEqual(res.body.projects.some((p: any) => p.id === emptyDraftProjectId), false);
    });

    test("draft project details is hidden from public / other users", async () => {
      // Anonymous user
      const anonRes = await request(app).get(`/api/projects/${emptyDraftProjectId}`);
      assert.strictEqual(anonRes.status, 404);

      // Rival caster
      const rivalRes = await request(app)
        .get(`/api/projects/${emptyDraftProjectId}`)
        .set("Authorization", `Bearer ${secondCasterToken}`);
      assert.strictEqual(rivalRes.status, 404);
    });

    test("owner caster can view their own draft project details", async () => {
      const res = await request(app)
        .get(`/api/projects/${emptyDraftProjectId}`)
        .set("Authorization", `Bearer ${casterToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.project.id, emptyDraftProjectId);
      assert.strictEqual(res.body.project.status, "DRAFT");
    });

    test("caster retrieves all their own projects (drafts and published)", async () => {
      const res = await request(app)
        .get("/api/projects/my-projects")
        .set("Authorization", `Bearer ${casterToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(Array.isArray(res.body.projects));
      assert.ok(res.body.projects.length >= 2);
    });
  });

  describe("Closing Workflow & Atomic State Updates", () => {
    test("caster closes project and all open roles transition to CLOSED", async () => {
      const res = await request(app)
        .post(`/api/projects/${publishedProjectId}/close`)
        .set("Authorization", `Bearer ${casterToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.project.status, "CLOSED");

      // Verify casting roles in the project were closed
      const roles = await prisma.castingRole.findMany({
        where: { projectId: publishedProjectId }
      });

      assert.ok(roles.length > 0);
      assert.ok(roles.every((r: any) => r.status === "CLOSED"));
    });

    test("blocks adding roles to a closed project", async () => {
      const res = await request(app)
        .post(`/api/projects/${publishedProjectId}/roles`)
        .set("Authorization", `Bearer ${casterToken}`)
        .send({
          title: "Late Role",
          description: "Should not be added to closed project."
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes("closed project"));
    });

    test("blocks publishing an already closed project", async () => {
      const res = await request(app)
        .post(`/api/projects/${publishedProjectId}/publish`)
        .set("Authorization", `Bearer ${casterToken}`);

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes("closed project"));
    });
  });
});
