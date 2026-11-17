import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../app.js";
import prisma from "../config/prisma.js";

process.env.NODE_ENV = "test";

describe("Profile Management Phase 3 Tests", () => {
  const timestamp = Date.now();
  const actorUser = {
    name: "Profile Actor",
    email: `prof_actor_${timestamp}@example.com`,
    phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
    password: "Password123!",
    role: "ACTOR" as const
  };

  const secondActorUser = {
    name: "Second Actor",
    email: `prof_actor2_${timestamp}@example.com`,
    phone: `8${Math.floor(100000000 + Math.random() * 900000000)}`,
    password: "Password123!",
    role: "ACTOR" as const
  };

  const casterUser = {
    name: "Profile Caster",
    email: `prof_caster_${timestamp}@example.com`,
    phone: `7${Math.floor(100000000 + Math.random() * 900000000)}`,
    password: "Password123!",
    role: "CASTER" as const
  };

  let actorToken = "";
  let secondActorToken = "";
  let casterToken = "";
  let actorProfileId = "";
  let casterProfileId = "";
  let createdExperienceId = "";

  before(async () => {
    // Register users
    const actorRes = await request(app).post("/api/auth/register").send(actorUser);
    actorToken = actorRes.body.token;

    const actor2Res = await request(app).post("/api/auth/register").send(secondActorUser);
    secondActorToken = actor2Res.body.token;

    const casterRes = await request(app).post("/api/auth/register").send(casterUser);
    casterToken = casterRes.body.token;
  });

  after(async () => {
    try {
      await prisma.user.deleteMany({
        where: {
          email: {
            in: [
              actorUser.email.toLowerCase(),
              secondActorUser.email.toLowerCase(),
              casterUser.email.toLowerCase()
            ]
          }
        }
      });
      await prisma.$disconnect();
    } catch {
      // Ignore cleanup error
    }
  });

  test("GET /api/profiles/metadata returns available skills, genders, and orientations", async () => {
    const res = await request(app).get("/api/profiles/metadata");

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.skills));
    assert.ok(res.body.skills.includes("ACTING"));
    assert.ok(res.body.skills.includes("MARTIAL_ARTS"));
    assert.ok(Array.isArray(res.body.genders));
    assert.ok(Array.isArray(res.body.sexualOrientations));
  });

  describe("Actor Profile Creation & Boundary", () => {
    test("blocks CASTER from creating an actor profile with 403 Forbidden", async () => {
      const res = await request(app)
        .post("/api/profiles/actor")
        .set("Authorization", `Bearer ${casterToken}`)
        .send({
          displayName: "Imposter Actor",
          dateOfBirth: "1995-05-15",
          gender: "MALE",
          sexualOrientation: "STRAIGHT"
        });

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
    });

    test("ACTOR creates their actor profile successfully", async () => {
      const res = await request(app)
        .post("/api/profiles/actor")
        .set("Authorization", `Bearer ${actorToken}`)
        .send({
          displayName: "Star Actor",
          dateOfBirth: "1998-04-12",
          gender: "FEMALE",
          sexualOrientation: "STRAIGHT",
          bio: "Experienced stage and screen actress.",
          skills: ["ACTING", "DANCING", "SINGING"]
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.profile.displayName, "Star Actor");
      assert.strictEqual(res.body.profile.sexualOrientation, "STRAIGHT");
      assert.strictEqual(res.body.profile.skills.length, 3);

      actorProfileId = res.body.profile.id;
    });

    test("rejects duplicate actor profile creation with 409 Conflict", async () => {
      const res = await request(app)
        .post("/api/profiles/actor")
        .set("Authorization", `Bearer ${actorToken}`)
        .send({
          displayName: "Duplicate Actor",
          dateOfBirth: "1998-04-12",
          gender: "FEMALE",
          sexualOrientation: "STRAIGHT"
        });

      assert.strictEqual(res.status, 409);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes("already exists"));
    });
  });

  describe("Actor Profile Retrieval & Privacy Filtering", () => {
    test("actor retrieves their own profile with full sensitive fields", async () => {
      const res = await request(app)
        .get("/api/profiles/actor/me")
        .set("Authorization", `Bearer ${actorToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.profile.sexualOrientation, "STRAIGHT");
      assert.ok(res.body.profile.dateOfBirth);
      assert.strictEqual(res.body.profile.user.email, actorUser.email.toLowerCase());
    });

    test("public profile strictly omits sensitive fields (sexualOrientation, dateOfBirth)", async () => {
      const res = await request(app).get(`/api/profiles/actor/${actorProfileId}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.profile.id, actorProfileId);
      assert.strictEqual(res.body.profile.displayName, "Star Actor");

      // Privacy checks:
      assert.strictEqual(res.body.profile.sexualOrientation, undefined);
      assert.strictEqual(res.body.profile.dateOfBirth, undefined);

      // Age calculation check:
      assert.ok(typeof res.body.profile.age === "number");
      assert.ok(res.body.profile.age >= 20);

      // Contact info check:
      assert.strictEqual(res.body.profile.phone, undefined);
      assert.strictEqual(res.body.profile.email, undefined);
    });

    test("actor updates profile skills and bio", async () => {
      const res = await request(app)
        .put("/api/profiles/actor/me")
        .set("Authorization", `Bearer ${actorToken}`)
        .send({
          bio: "Updated award-winning actress biography.",
          skills: ["ACTING", "DANCING", "SINGING", "VOICE_ACTING"]
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.profile.bio, "Updated award-winning actress biography.");
      assert.strictEqual(res.body.profile.skills.length, 4);
    });
  });

  describe("Caster Profile Management", () => {
    test("blocks ACTOR from creating a caster profile with 403 Forbidden", async () => {
      const res = await request(app)
        .post("/api/profiles/caster")
        .set("Authorization", `Bearer ${actorToken}`)
        .send({
          displayName: "Imposter Caster"
        });

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
    });

    test("CASTER creates their caster profile successfully", async () => {
      const res = await request(app)
        .post("/api/profiles/caster")
        .set("Authorization", `Bearer ${casterToken}`)
        .send({
          displayName: "Apex Casting Agency",
          bio: "Leading casting director for major motion pictures."
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.profile.displayName, "Apex Casting Agency");

      casterProfileId = res.body.profile.id;
    });

    test("rejects duplicate caster profile creation with 409 Conflict", async () => {
      const res = await request(app)
        .post("/api/profiles/caster")
        .set("Authorization", `Bearer ${casterToken}`)
        .send({
          displayName: "Duplicate Caster"
        });

      assert.strictEqual(res.status, 409);
      assert.strictEqual(res.body.success, false);
    });

    test("caster retrieves their own profile", async () => {
      const res = await request(app)
        .get("/api/profiles/caster/me")
        .set("Authorization", `Bearer ${casterToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.profile.displayName, "Apex Casting Agency");
    });

    test("caster updates their profile", async () => {
      const res = await request(app)
        .put("/api/profiles/caster/me")
        .set("Authorization", `Bearer ${casterToken}`)
        .send({
          bio: "Updated agency description."
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.profile.bio, "Updated agency description.");
    });

    test("retrieves public caster profile", async () => {
      const res = await request(app).get(`/api/profiles/caster/${casterProfileId}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.profile.displayName, "Apex Casting Agency");
    });
  });

  describe("Experience Management & Ownership Security", () => {
    test("actor adds an experience record", async () => {
      const res = await request(app)
        .post("/api/profiles/actor/me/experiences")
        .set("Authorization", `Bearer ${actorToken}`)
        .send({
          roleTitle: "Lead Protagonist",
          organization: "National Theatre",
          description: "Starred in 50+ sold-out stage performances.",
          startDate: "2022-01-01",
          endDate: "2023-01-01",
          isCurrent: false
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.experience.roleTitle, "Lead Protagonist");

      createdExperienceId = res.body.experience.id;
    });

    test("actor lists their experiences", async () => {
      const res = await request(app)
        .get("/api/profiles/actor/me/experiences")
        .set("Authorization", `Bearer ${actorToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(Array.isArray(res.body.experiences));
      assert.strictEqual(res.body.experiences.length, 1);
    });

    test("blocks second actor from modifying first actor's experience (ownership check)", async () => {
      // First second actor creates their own profile so they have one
      await request(app)
        .post("/api/profiles/actor")
        .set("Authorization", `Bearer ${secondActorToken}`)
        .send({
          displayName: "Second Actor",
          dateOfBirth: "2000-01-01",
          gender: "MALE",
          sexualOrientation: "OTHER"
        });

      // Now attempts to update first actor's experience
      const res = await request(app)
        .put(`/api/profiles/actor/me/experiences/${createdExperienceId}`)
        .set("Authorization", `Bearer ${secondActorToken}`)
        .send({
          roleTitle: "Hijacked Role"
        });

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes("Forbidden"));
    });

    test("actor updates their own experience", async () => {
      const res = await request(app)
        .put(`/api/profiles/actor/me/experiences/${createdExperienceId}`)
        .set("Authorization", `Bearer ${actorToken}`)
        .send({
          roleTitle: "Senior Lead Protagonist"
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.experience.roleTitle, "Senior Lead Protagonist");
    });

    test("public profile now reflects the updated experience", async () => {
      const res = await request(app).get(`/api/profiles/actor/${actorProfileId}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.profile.experiences.length, 1);
      assert.strictEqual(res.body.profile.experiences[0].roleTitle, "Senior Lead Protagonist");
    });

    test("blocks second actor from deleting first actor's experience", async () => {
      const res = await request(app)
        .delete(`/api/profiles/actor/me/experiences/${createdExperienceId}`)
        .set("Authorization", `Bearer ${secondActorToken}`);

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
    });

    test("actor deletes their own experience", async () => {
      const res = await request(app)
        .delete(`/api/profiles/actor/me/experiences/${createdExperienceId}`)
        .set("Authorization", `Bearer ${actorToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);

      // Verify experience is gone
      const listRes = await request(app)
        .get("/api/profiles/actor/me/experiences")
        .set("Authorization", `Bearer ${actorToken}`);

      assert.strictEqual(listRes.body.experiences.length, 0);
    });
  });
});
