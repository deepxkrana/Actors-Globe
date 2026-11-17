import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../app.js";
import prisma from "../config/prisma.js";
import { grantSubscription } from "../services/subscription.service.js";

process.env.NODE_ENV = "test";

describe("Search and Discovery Phase 6 Tests", () => {
  const timestamp = Date.now();

  const casterUser = {
    name: "Search Caster",
    email: `search_caster_${timestamp}@example.com`,
    phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
    password: "Password123!",
    role: "CASTER" as const
  };

  const actorAUser = {
    name: "Aria Sterling",
    email: `search_aria_${timestamp}@example.com`,
    phone: `8${Math.floor(100000000 + Math.random() * 900000000)}`,
    password: "Password123!",
    role: "ACTOR" as const
  };

  const actorBUser = {
    name: "Bruce Tanaka",
    email: `search_bruce_${timestamp}@example.com`,
    phone: `7${Math.floor(100000000 + Math.random() * 900000000)}`,
    password: "Password123!",
    role: "ACTOR" as const
  };

  const deactivatedActorUser = {
    name: "Deactivated Actor",
    email: `search_deact_${timestamp}@example.com`,
    phone: `6${Math.floor(100000000 + Math.random() * 900000000)}`,
    password: "Password123!",
    role: "ACTOR" as const
  };

  let casterToken = "";
  let casterUserId = "";
  let actorAToken = "";
  let actorBToken = "";
  let deactivatedActorToken = "";

  let actorAProfileId = "";
  let actorBProfileId = "";

  let publishedProjectId = "";
  let draftProjectId = "";
  let femaleRoleId = "";
  let stuntRoleId = "";

  before(async () => {
    // 1. Register users
    const cRes = await request(app).post("/api/auth/register").send(casterUser);
    casterToken = cRes.body.token;
    casterUserId = cRes.body.user.id;

    const aRes = await request(app).post("/api/auth/register").send(actorAUser);
    actorAToken = aRes.body.token;

    const bRes = await request(app).post("/api/auth/register").send(actorBUser);
    actorBToken = bRes.body.token;

    const dRes = await request(app).post("/api/auth/register").send(deactivatedActorUser);
    deactivatedActorToken = dRes.body.token;

    // Grant premium to caster to create projects
    await grantSubscription(casterUserId, "CASTER_PREMIUM", 30);

    // 2. Create caster profile
    await request(app)
      .post("/api/profiles/caster")
      .set("Authorization", `Bearer ${casterToken}`)
      .send({ displayName: "Paramount Search Studio" });

    // 3. Create Actor Profiles
    // Actor A: Female, 24 years old (born 2002-01-15), musical skills
    const actorARes = await request(app)
      .post("/api/profiles/actor")
      .set("Authorization", `Bearer ${actorAToken}`)
      .send({
        displayName: "Aria Musical Sterling",
        dateOfBirth: "2002-01-15",
        gender: "FEMALE",
        sexualOrientation: "STRAIGHT",
        bio: "Musical theatre performer with Broadway classical training and vocal versatility",
        skills: ["ACTING", "SINGING", "DANCING"]
      });
    actorAProfileId = actorARes.body.profile.id;

    // Add experience to Actor A
    await request(app)
      .post("/api/profiles/actor/me/experiences")
      .set("Authorization", `Bearer ${actorAToken}`)
      .send({
        roleTitle: "Lead Soprano in Phantom",
        organization: "West End Theatre",
        description: "Performed lead role for 48 sold-out performances across UK",
        isCurrent: false
      });

    // Actor B: Male, 34 years old (born 1992-06-10), action/stunt skills
    const actorBRes = await request(app)
      .post("/api/profiles/actor")
      .set("Authorization", `Bearer ${actorBToken}`)
      .send({
        displayName: "Bruce Tanaka Action",
        dateOfBirth: "1992-06-10",
        gender: "MALE",
        sexualOrientation: "PREFER_NOT_TO_SAY",
        bio: "Action hero and high-intensity martial arts stunt coordinator",
        skills: ["MARTIAL_ARTS", "STUNT_PERFORMANCE", "FIGHTING"]
      });
    actorBProfileId = actorBRes.body.profile.id;

    // Deactivated actor profile
    await request(app)
      .post("/api/profiles/actor")
      .set("Authorization", `Bearer ${deactivatedActorToken}`)
      .send({
        displayName: "Ghost Inactive Actor",
        dateOfBirth: "1995-03-20",
        gender: "NON_BINARY",
        sexualOrientation: "OTHER",
        bio: "Inactive actor who should not be discovered",
        skills: ["ACTING"]
      });
    // Deactivate account
    await request(app)
      .post("/api/auth/deactivate")
      .set("Authorization", `Bearer ${deactivatedActorToken}`)
      .send();

    // 4. Create Projects
    // Project 1: Published Feature Film in Mumbai
    const pubProjRes = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${casterToken}`)
      .send({
        title: "Echoes of Mumbai Skyline",
        description: "A neo-noir feature film exploring the hidden alleyways of Mumbai",
        projectType: "FEATURE_FILM",
        location: "Mumbai, India",
        roles: [
          {
            title: "Lead Female Detective",
            description: "Sharp undercover detective handling high-stakes corporate crime",
            genderRequirement: "FEMALE",
            minAge: 22,
            maxAge: 28
          },
          {
            title: "Rooftop Stunt Specialist",
            description: "Parkour and precision combat stunt double for action sequences",
            genderRequirement: "ANY",
            minAge: 25,
            maxAge: 40
          }
        ]
      });
    publishedProjectId = pubProjRes.body.project.id;
    femaleRoleId = pubProjRes.body.project.castingRoles.find((r: any) => r.genderRequirement === "FEMALE").id;
    stuntRoleId = pubProjRes.body.project.castingRoles.find((r: any) => r.genderRequirement === "ANY").id;

    // Publish Project 1
    await request(app)
      .post(`/api/projects/${publishedProjectId}/publish`)
      .set("Authorization", `Bearer ${casterToken}`)
      .send();

    // Project 2: Draft Short Film in London (MUST NOT APPEAR IN SEARCH)
    const draftProjRes = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${casterToken}`)
      .send({
        title: "Secret London Draft Chronicle",
        description: "Confidential draft project that is unpublished",
        projectType: "SHORT_FILM",
        location: "London, UK",
        roles: [
          {
            title: "Secret Draft Operative",
            description: "Role in an unpublished draft",
            genderRequirement: "ANY"
          }
        ]
      });
    draftProjectId = draftProjRes.body.project.id;
  });

  after(async () => {
    try {
      await prisma.user.deleteMany({
        where: {
          email: {
            in: [
              casterUser.email,
              actorAUser.email,
              actorBUser.email,
              deactivatedActorUser.email
            ]
          }
        }
      });
    } catch {
      // Ignore cleanup error
    }
  });

  // -----------------------------------------------------------
  // 1. Search Metadata & Filter Options
  // -----------------------------------------------------------
  describe("Search Metadata & Filter Catalog", () => {
    test("GET /api/search/filters returns supported skills, genders, and project types", async () => {
      const res = await request(app).get("/api/search/filters");

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data.skills));
      assert.ok(res.body.data.skills.includes("ACTING"));
      assert.ok(res.body.data.skills.includes("SINGING"));
      assert.ok(Array.isArray(res.body.data.genders));
      assert.ok(res.body.data.genders.includes("FEMALE"));
      assert.ok(Array.isArray(res.body.data.projectTypes));
      assert.ok(res.body.data.projectTypes.includes("FEATURE_FILM"));
      assert.ok(Array.isArray(res.body.data.genderRequirements));
      assert.ok(res.body.data.sortOptions.actors.includes("age"));
    });
  });

  // -----------------------------------------------------------
  // 2. Actor Discovery & Privacy Filtering
  // -----------------------------------------------------------
  describe("Actor Discovery & Strict Privacy Protection", () => {
    test("discovers actors by query string (q) matching name or bio", async () => {
      const res = await request(app)
        .get("/api/search/actors")
        .query({ q: "Broadway" });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      const ids = res.body.data.items.map((a: any) => a.id);
      assert.ok(ids.includes(actorAProfileId));
      assert.ok(!ids.includes(actorBProfileId));
    });

    test("filters actors by single and multiple skills", async () => {
      // Skill matching Bruce Tanaka
      const resBruce = await request(app)
        .get("/api/search/actors")
        .query({ skills: "MARTIAL_ARTS" });

      assert.equal(resBruce.status, 200);
      const bruceFound = resBruce.body.data.items.find((a: any) => a.id === actorBProfileId);
      assert.ok(bruceFound);

      // Comma-separated skills with 'all' match mode
      const resAll = await request(app)
        .get("/api/search/actors")
        .query({ skills: "ACTING,SINGING", skillMatch: "all" });

      assert.equal(resAll.status, 200);
      const ariaFound = resAll.body.data.items.find((a: any) => a.id === actorAProfileId);
      assert.ok(ariaFound);
      const bruceInAll = resAll.body.data.items.find((a: any) => a.id === actorBProfileId);
      assert.equal(bruceInAll, undefined);
    });

    test("filters actors by gender", async () => {
      const res = await request(app)
        .get("/api/search/actors")
        .query({ gender: "FEMALE", q: "Aria" });

      assert.equal(res.status, 200);
      assert.equal(res.body.data.items.length, 1);
      assert.equal(res.body.data.items[0].id, actorAProfileId);
      assert.equal(res.body.data.items[0].gender, "FEMALE");
    });

    test("filters actors by age boundaries (minAge, maxAge)", async () => {
      // Aria is ~24 years old; Bruce is ~34 years old
      const resYoung = await request(app)
        .get("/api/search/actors")
        .query({ minAge: 20, maxAge: 28, q: "Aria" });

      assert.equal(resYoung.status, 200);
      assert.equal(resYoung.body.data.items.length, 1);
      assert.equal(resYoung.body.data.items[0].id, actorAProfileId);

      const resOlder = await request(app)
        .get("/api/search/actors")
        .query({ minAge: 30, maxAge: 40, q: "Bruce" });

      assert.equal(resOlder.status, 200);
      assert.equal(resOlder.body.data.items.length, 1);
      assert.equal(resOlder.body.data.items[0].id, actorBProfileId);
    });

    test("filters actors by experience presence and keyword", async () => {
      // Actor A has experience; Actor B has 0 experiences
      const resExp = await request(app)
        .get("/api/search/actors")
        .query({ hasExperience: "true", q: "Aria" });

      assert.equal(resExp.status, 200);
      assert.ok(resExp.body.data.items.some((a: any) => a.id === actorAProfileId));

      const resKeyword = await request(app)
        .get("/api/search/actors")
        .query({ experienceKeyword: "Phantom" });

      assert.equal(resKeyword.status, 200);
      assert.ok(resKeyword.body.data.items.some((a: any) => a.id === actorAProfileId));
    });

    test("PRIVACY RULE: strictly omits sexualOrientation and dateOfBirth; computes dynamic age", async () => {
      const res = await request(app)
        .get("/api/search/actors")
        .query({ q: "Aria" });

      assert.equal(res.status, 200);
      const actor = res.body.data.items.find((a: any) => a.id === actorAProfileId);
      assert.ok(actor);

      // Sensitive fields must NOT exist in the response object
      assert.equal(actor.sexualOrientation, undefined);
      assert.equal(actor.dateOfBirth, undefined);
      assert.equal(actor.email, undefined);
      assert.equal(actor.phone, undefined);
      assert.equal(actor.passwordHash, undefined);

      // Safe calculated age must exist
      assert.ok(typeof actor.age === "number");
      assert.ok(actor.age >= 24 && actor.age <= 25);
    });

    test("PRIVACY & SECURITY: deactivated accounts are excluded from discovery", async () => {
      const res = await request(app)
        .get("/api/search/actors")
        .query({ q: "Ghost Inactive Actor" });

      assert.equal(res.status, 200);
      assert.equal(res.body.data.items.length, 0);
    });
  });

  // -----------------------------------------------------------
  // 3. Project Discovery & Publication Rules
  // -----------------------------------------------------------
  describe("Project Discovery & Publication Boundary", () => {
    test("public search discovers published projects", async () => {
      const res = await request(app)
        .get("/api/search/projects")
        .query({ q: "Echoes of Mumbai" });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.items.some((p: any) => p.id === publishedProjectId));
      const project = res.body.data.items.find((p: any) => p.id === publishedProjectId);
      assert.equal(project.status, "PUBLISHED");
      assert.ok(project.castingRoles.length > 0);
      assert.equal(project.openRolesCount, 2);
    });

    test("PUBLICATION RULE: unpublished/draft projects are NEVER returned in discovery", async () => {
      const res = await request(app)
        .get("/api/search/projects")
        .query({ q: "Secret London Draft Chronicle" });

      assert.equal(res.status, 200);
      assert.equal(res.body.data.items.length, 0);
      const foundDraft = res.body.data.items.find((p: any) => p.id === draftProjectId);
      assert.equal(foundDraft, undefined);
    });

    test("filters projects by projectType and location", async () => {
      const resType = await request(app)
        .get("/api/search/projects")
        .query({ projectType: "FEATURE_FILM", location: "Mumbai" });

      assert.equal(resType.status, 200);
      assert.ok(resType.body.data.items.some((p: any) => p.id === publishedProjectId));

      const resOther = await request(app)
        .get("/api/search/projects")
        .query({ projectType: "THEATRE" });

      assert.equal(resOther.status, 200);
      assert.ok(!resOther.body.data.items.some((p: any) => p.id === publishedProjectId));
    });

    test("paginates project search results deterministically", async () => {
      const res = await request(app)
        .get("/api/search/projects")
        .query({ page: 1, limit: 1 });

      assert.equal(res.status, 200);
      assert.equal(res.body.data.items.length, 1);
      assert.equal(res.body.data.pagination.page, 1);
      assert.equal(res.body.data.pagination.limit, 1);
      assert.ok(res.body.data.pagination.total >= 1);
    });
  });

  // -----------------------------------------------------------
  // 4. Casting Role Discovery & Suitability Matching
  // -----------------------------------------------------------
  describe("Casting Role Discovery & Actor Suitability", () => {
    test("discovers open roles in published projects", async () => {
      const res = await request(app)
        .get("/api/search/roles")
        .query({ q: "Detective" });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.items.some((r: any) => r.id === femaleRoleId));
      const role = res.body.data.items.find((r: any) => r.id === femaleRoleId);
      assert.equal(role.title, "Lead Female Detective");
      assert.equal(role.project.id, publishedProjectId);
      assert.equal(role.project.status, "PUBLISHED");
    });

    test("filters roles by genderRequirement matching FEMALE and ANY", async () => {
      const res = await request(app)
        .get("/api/search/roles")
        .query({ genderRequirement: "FEMALE", location: "Mumbai" });

      assert.equal(res.status, 200);
      const roleIds = res.body.data.items.map((r: any) => r.id);
      // Both FEMALE specific and ANY roles match
      assert.ok(roleIds.includes(femaleRoleId));
      assert.ok(roleIds.includes(stuntRoleId));
    });

    test("matches roles suitable for an actor of a given age", async () => {
      // Aria is 24: fits Detective (22-28) and Stunt (25-40: wait, minAge 25 doesn't fit 24)
      const res24 = await request(app)
        .get("/api/search/roles")
        .query({ age: 24, location: "Mumbai" });

      assert.equal(res24.status, 200);
      const roleIds = res24.body.data.items.map((r: any) => r.id);
      assert.ok(roleIds.includes(femaleRoleId));
      assert.ok(!roleIds.includes(stuntRoleId));

      // Bruce is 34: fits Stunt (25-40), does NOT fit Detective (22-28)
      const res34 = await request(app)
        .get("/api/search/roles")
        .query({ age: 34, location: "Mumbai" });

      assert.equal(res34.status, 200);
      const roleIds34 = res34.body.data.items.map((r: any) => r.id);
      assert.ok(roleIds34.includes(stuntRoleId));
      assert.ok(!roleIds34.includes(femaleRoleId));
    });

    test("does not expose roles belonging to draft projects", async () => {
      const res = await request(app)
        .get("/api/search/roles")
        .query({ q: "Secret Draft Operative" });

      assert.equal(res.status, 200);
      assert.equal(res.body.data.items.length, 0);
    });
  });

  // -----------------------------------------------------------
  // 5. Query Validation & Input Boundaries
  // -----------------------------------------------------------
  describe("Query Validation and Input Boundaries", () => {
    test("rejects query when minAge is greater than maxAge with 400 Bad Request", async () => {
      const res = await request(app)
        .get("/api/search/actors")
        .query({ minAge: 40, maxAge: 20 });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.ok(res.body.message.includes("Validation failed"));
    });

    test("rejects query with invalid skill enum with 400 Bad Request", async () => {
      const res = await request(app)
        .get("/api/search/actors")
        .query({ skills: "ASTRONAUT_SURGEON" });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });

    test("caps limit parameter to maximum allowed 50", async () => {
      const res = await request(app)
        .get("/api/search/projects")
        .query({ limit: 100 });

      // Limit 100 exceeds max(50) in validator schema
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });
  });
});
