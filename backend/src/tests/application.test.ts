import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../app.js";
import prisma from "../config/prisma.js";
import { grantSubscription } from "../services/subscription.service.js";

process.env.NODE_ENV = "test";

describe("Applications and Casting Requests Phase 7 Tests", () => {
  const timestamp = Date.now();

  const casterUser = {
    name: "Casting Director Alice",
    email: `app_caster_${timestamp}@example.com`,
    phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
    password: "Password123!",
    role: "CASTER" as const
  };

  const rivalCasterUser = {
    name: "Rival Caster Bob",
    email: `app_rival_${timestamp}@example.com`,
    phone: `8${Math.floor(100000000 + Math.random() * 900000000)}`,
    password: "Password123!",
    role: "CASTER" as const
  };

  const actorUser1 = {
    name: "Actor Clara",
    email: `app_actor1_${timestamp}@example.com`,
    phone: `7${Math.floor(100000000 + Math.random() * 900000000)}`,
    password: "Password123!",
    role: "ACTOR" as const
  };

  const actorUser2 = {
    name: "Actor David",
    email: `app_actor2_${timestamp}@example.com`,
    phone: `6${Math.floor(100000000 + Math.random() * 900000000)}`,
    password: "Password123!",
    role: "ACTOR" as const
  };

  let casterToken = "";
  let casterUserId = "";
  let rivalCasterToken = "";
  let rivalCasterUserId = "";
  let actor1Token = "";
  let actor1UserId = "";
  let actor1ProfileId = "";
  let actor2Token = "";
  let actor2UserId = "";
  let actor2ProfileId = "";

  let publishedProjectId = "";
  let openRoleId = "";
  let secondaryRoleId = "";
  let draftProjectId = "";
  let draftRoleId = "";
  let closedRoleId = "";

  let application1Id = "";

  before(async () => {
    // 1. Register users
    const c1 = await request(app).post("/api/auth/register").send(casterUser);
    casterToken = c1.body.token;
    casterUserId = c1.body.user.id;

    const c2 = await request(app).post("/api/auth/register").send(rivalCasterUser);
    rivalCasterToken = c2.body.token;
    rivalCasterUserId = c2.body.user.id;

    const a1 = await request(app).post("/api/auth/register").send(actorUser1);
    actor1Token = a1.body.token;
    actor1UserId = a1.body.user.id;

    const a2 = await request(app).post("/api/auth/register").send(actorUser2);
    actor2Token = a2.body.token;
    actor2UserId = a2.body.user.id;

    // Grant premium to casters
    await grantSubscription(casterUserId, "CASTER_PREMIUM", 30);
    await grantSubscription(rivalCasterUserId, "CASTER_PREMIUM", 30);

    // 2. Create caster profiles
    await request(app)
      .post("/api/profiles/caster")
      .set("Authorization", `Bearer ${casterToken}`)
      .send({ displayName: "Paramount Productions" });

    await request(app)
      .post("/api/profiles/caster")
      .set("Authorization", `Bearer ${rivalCasterToken}`)
      .send({ displayName: "Universal Pictures" });

    // 3. Create actor profiles
    const prof1 = await request(app)
      .post("/api/profiles/actor")
      .set("Authorization", `Bearer ${actor1Token}`)
      .send({
        displayName: "Clara Bow",
        dateOfBirth: "2000-05-12",
        gender: "FEMALE",
        sexualOrientation: "STRAIGHT",
        bio: "Experienced dramatic actress",
        skills: ["ACTING", "SINGING"]
      });
    actor1ProfileId = prof1.body.profile.id;

    const prof2 = await request(app)
      .post("/api/profiles/actor")
      .set("Authorization", `Bearer ${actor2Token}`)
      .send({
        displayName: "David Niven",
        dateOfBirth: "1998-11-20",
        gender: "MALE",
        sexualOrientation: "PREFER_NOT_TO_SAY",
        bio: "Classical stage and screen performer",
        skills: ["ACTING", "VOICE_ACTING"]
      });
    actor2ProfileId = prof2.body.profile.id;

    // 4. Create Published Project with roles
    const pubProj = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${casterToken}`)
      .send({
        title: "The Golden Sunset",
        description: "An epic romantic drama set in coastal California",
        projectType: "FEATURE_FILM",
        location: "Monterey, CA",
        roles: [
          {
            title: "Protagonist Marina",
            description: "Lead role in romantic drama",
            genderRequirement: "FEMALE",
            minAge: 20,
            maxAge: 30
          },
          {
            title: "Lighthouse Keeper James",
            description: "Supporting dramatic role",
            genderRequirement: "MALE",
            minAge: 25,
            maxAge: 45
          },
          {
            title: "Archived Role",
            description: "Role that will be immediately closed",
            genderRequirement: "ANY"
          }
        ]
      });
    publishedProjectId = pubProj.body.project.id;
    openRoleId = pubProj.body.project.castingRoles.find((r: any) => r.title === "Protagonist Marina").id;
    secondaryRoleId = pubProj.body.project.castingRoles.find((r: any) => r.title === "Lighthouse Keeper James").id;
    closedRoleId = pubProj.body.project.castingRoles.find((r: any) => r.title === "Archived Role").id;

    // Close the archived role
    await request(app)
      .put(`/api/projects/${publishedProjectId}/roles/${closedRoleId}`)
      .set("Authorization", `Bearer ${casterToken}`)
      .send({ status: "CLOSED" });

    // Publish project
    await request(app)
      .post(`/api/projects/${publishedProjectId}/publish`)
      .set("Authorization", `Bearer ${casterToken}`)
      .send();

    // 5. Create Draft Project (Unpublished)
    const draftProj = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${casterToken}`)
      .send({
        title: "Unreleased Draft Project",
        description: "Unpublished internal project",
        projectType: "SHORT_FILM",
        location: "Los Angeles, CA",
        roles: [
          {
            title: "Draft Exclusive Role",
            description: "Role in an unpublished project",
            genderRequirement: "ANY"
          }
        ]
      });
    draftProjectId = draftProj.body.project.id;
    draftRoleId = draftProj.body.project.castingRoles[0].id;
  });

  after(async () => {
    try {
      await prisma.user.deleteMany({
        where: {
          email: {
            in: [
              casterUser.email,
              rivalCasterUser.email,
              actorUser1.email,
              actorUser2.email
            ]
          }
        }
      });
    } catch {
      // Ignore cleanup error
    }
  });

  // -----------------------------------------------------------
  // 1. Application Submission & Business Boundaries
  // -----------------------------------------------------------
  describe("Application Submission & Business Boundaries", () => {
    test("blocks CASTER from applying to casting roles with 403 Forbidden", async () => {
      const res = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${casterToken}`)
        .send({ castingRoleId: openRoleId });

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
    });

    test("blocks application to a role in a DRAFT (unpublished) project with 400 Bad Request", async () => {
      const res = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${actor1Token}`)
        .send({ castingRoleId: draftRoleId });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.ok(res.body.message.includes("unpublished"));
    });

    test("blocks application to a CLOSED role with 400 Bad Request", async () => {
      const res = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${actor1Token}`)
        .send({ castingRoleId: closedRoleId });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.ok(res.body.message.includes("no longer open"));
    });

    test("ACTOR applies successfully to an open role in published project", async () => {
      const res = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${actor1Token}`)
        .send({ castingRoleId: openRoleId });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.status, "PENDING");
      assert.equal(res.body.data.castingRoleId, openRoleId);
      application1Id = res.body.data.id;

      // Verify caster received a notification
      const notifRes = await request(app)
        .get("/api/notifications")
        .set("Authorization", `Bearer ${casterToken}`);

      assert.equal(notifRes.status, 200);
      const appNotif = notifRes.body.data.notifications.find(
        (n: any) => n.referenceId === application1Id
      );
      assert.ok(appNotif);
      assert.ok(appNotif.message.includes("Protagonist Marina"));
    });

    test("DUPLICATE PREVENTED: rejects repeated application for same role with 409 Conflict", async () => {
      const res = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${actor1Token}`)
        .send({ castingRoleId: openRoleId });

      assert.equal(res.status, 409);
      assert.equal(res.body.success, false);
      assert.ok(res.body.message.includes("already applied"));
    });
  });

  // -----------------------------------------------------------
  // 2. Application Retrieval & Authorization Security
  // -----------------------------------------------------------
  describe("Application Retrieval & Authorization Security", () => {
    test("actor retrieves their own submitted applications", async () => {
      const res = await request(app)
        .get("/api/applications/my-applications")
        .set("Authorization", `Bearer ${actor1Token}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.applications.some((a: any) => a.id === application1Id));
      const appItem = res.body.data.applications.find((a: any) => a.id === application1Id);
      assert.equal(appItem.castingRole.title, "Protagonist Marina");
      assert.equal(appItem.castingRole.project.title, "The Golden Sunset");
    });

    test("caster retrieves applications received for their casting role", async () => {
      const res = await request(app)
        .get(`/api/applications/role/${openRoleId}`)
        .set("Authorization", `Bearer ${casterToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.applications.some((a: any) => a.id === application1Id));
      const appItem = res.body.data.applications.find((a: any) => a.id === application1Id);
      assert.equal(appItem.actor.displayName, "Clara Bow");
      // Privacy check: sensitive fields omitted, calculated age present
      assert.equal(appItem.actor.sexualOrientation, undefined);
      assert.equal(appItem.actor.dateOfBirth, undefined);
      assert.ok(typeof appItem.actor.age === "number");
    });

    test("AUTHORIZATION: blocks rival caster from viewing applications for first caster's role with 403 Forbidden", async () => {
      const res = await request(app)
        .get(`/api/applications/role/${openRoleId}`)
        .set("Authorization", `Bearer ${rivalCasterToken}`);

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
    });

    test("applicant actor and project caster can view single application details", async () => {
      // Applicant actor views application
      const resActor = await request(app)
        .get(`/api/applications/${application1Id}`)
        .set("Authorization", `Bearer ${actor1Token}`);

      assert.equal(resActor.status, 200);
      assert.equal(resActor.body.data.id, application1Id);

      // Owning caster views application
      const resCaster = await request(app)
        .get(`/api/applications/${application1Id}`)
        .set("Authorization", `Bearer ${casterToken}`);

      assert.equal(resCaster.status, 200);
      assert.equal(resCaster.body.data.id, application1Id);

      // Unrelated actor cannot view application
      const resOtherActor = await request(app)
        .get(`/api/applications/${application1Id}`)
        .set("Authorization", `Bearer ${actor2Token}`);

      assert.equal(resOtherActor.status, 403);
    });
  });

  // -----------------------------------------------------------
  // 3. Application Status Transitions & Notifications
  // -----------------------------------------------------------
  describe("Application Status Transitions & Notifications", () => {
    test("blocks ACTOR from updating application status with 403 Forbidden", async () => {
      const res = await request(app)
        .patch(`/api/applications/${application1Id}/status`)
        .set("Authorization", `Bearer ${actor1Token}`)
        .send({ status: "ACCEPTED" });

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
    });

    test("blocks rival caster from updating first caster's application status with 403 Forbidden", async () => {
      const res = await request(app)
        .patch(`/api/applications/${application1Id}/status`)
        .set("Authorization", `Bearer ${rivalCasterToken}`)
        .send({ status: "ACCEPTED" });

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
    });

    test("owning caster accepts application and applicant actor receives notification", async () => {
      const res = await request(app)
        .patch(`/api/applications/${application1Id}/status`)
        .set("Authorization", `Bearer ${casterToken}`)
        .send({ status: "ACCEPTED" });

      assert.equal(res.status, 200);
      assert.equal(res.body.data.status, "ACCEPTED");

      // Verify applicant actor received APPLICATION_ACCEPTED notification
      const notifRes = await request(app)
        .get("/api/notifications")
        .set("Authorization", `Bearer ${actor1Token}`);

      assert.equal(notifRes.status, 200);
      const acceptedNotif = notifRes.body.data.notifications.find(
        (n: any) => n.type === "APPLICATION_ACCEPTED" && n.referenceId === application1Id
      );
      assert.ok(acceptedNotif);
      assert.ok(acceptedNotif.title.includes("Accepted"));
    });

    test("owning caster rejects candidate application and actor receives APPLICATION_REJECTED notification", async () => {
      // Actor 2 applies to secondary role
      const app2Res = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${actor2Token}`)
        .send({ castingRoleId: secondaryRoleId });

      assert.equal(app2Res.status, 201);
      const app2Id = app2Res.body.data.id;

      // Caster rejects Actor 2
      const rejRes = await request(app)
        .patch(`/api/applications/${app2Id}/status`)
        .set("Authorization", `Bearer ${casterToken}`)
        .send({ status: "REJECTED" });

      assert.equal(rejRes.status, 200);
      assert.equal(rejRes.body.data.status, "REJECTED");

      // Verify Actor 2 received APPLICATION_REJECTED notification
      const notifRes = await request(app)
        .get("/api/notifications")
        .set("Authorization", `Bearer ${actor2Token}`);

      assert.equal(notifRes.status, 200);
      const rejNotif = notifRes.body.data.notifications.find(
        (n: any) => n.type === "APPLICATION_REJECTED" && n.referenceId === app2Id
      );
      assert.ok(rejNotif);
    });
  });

  // -----------------------------------------------------------
  // 4. Application Withdrawal
  // -----------------------------------------------------------
  describe("Application Withdrawal Lifecycle", () => {
    test("actor can withdraw their own pending application", async () => {
      // Actor 2 applies to openRoleId (PENDING)
      const submitRes = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${actor2Token}`)
        .send({ castingRoleId: openRoleId });

      assert.equal(submitRes.status, 201);
      const pendingAppId = submitRes.body.data.id;

      // Actor 2 withdraws application
      const withdrawRes = await request(app)
        .delete(`/api/applications/${pendingAppId}`)
        .set("Authorization", `Bearer ${actor2Token}`);

      assert.equal(withdrawRes.status, 200);
      assert.equal(withdrawRes.body.success, true);

      // Verify subsequent retrieval is 404
      const getRes = await request(app)
        .get(`/api/applications/${pendingAppId}`)
        .set("Authorization", `Bearer ${actor2Token}`);

      assert.equal(getRes.status, 404);
    });

    test("cannot withdraw an application that has already been accepted", async () => {
      // application1Id is already ACCEPTED
      const res = await request(app)
        .delete(`/api/applications/${application1Id}`)
        .set("Authorization", `Bearer ${actor1Token}`);

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.ok(res.body.message.includes("Cannot withdraw"));
    });
  });

  // -----------------------------------------------------------
  // 5. Casting Requests Management & Responses
  // -----------------------------------------------------------
  describe("Casting Requests (Direct & Role-Based)", () => {
    let directRequestId = "";
    let roleRequestId = "";

    test("blocks ACTOR from sending casting requests with 403 Forbidden", async () => {
      const res = await request(app)
        .post("/api/casting-requests")
        .set("Authorization", `Bearer ${actor1Token}`)
        .send({ actorId: actor2ProfileId });

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
    });

    test("caster sends direct casting request to an actor", async () => {
      const res = await request(app)
        .post("/api/casting-requests")
        .set("Authorization", `Bearer ${casterToken}`)
        .send({ actorId: actor1ProfileId });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.status, "PENDING");
      assert.equal(res.body.data.castingRoleId, null);
      directRequestId = res.body.data.id;

      // Verify actor received CASTING_REQUEST_RECEIVED notification
      const notifRes = await request(app)
        .get("/api/notifications")
        .set("Authorization", `Bearer ${actor1Token}`);

      assert.equal(notifRes.status, 200);
      const reqNotif = notifRes.body.data.notifications.find(
        (n: any) => n.type === "CASTING_REQUEST_RECEIVED" && n.referenceId === directRequestId
      );
      assert.ok(reqNotif);
    });

    test("caster sends role-specific casting request to another actor", async () => {
      const res = await request(app)
        .post("/api/casting-requests")
        .set("Authorization", `Bearer ${casterToken}`)
        .send({ actorId: actor2ProfileId, castingRoleId: secondaryRoleId });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.status, "PENDING");
      assert.equal(res.body.data.castingRoleId, secondaryRoleId);
      roleRequestId = res.body.data.id;
    });

    test("DUPLICATE PREVENTED: rejects duplicate pending casting request to same actor/role with 409", async () => {
      const res = await request(app)
        .post("/api/casting-requests")
        .set("Authorization", `Bearer ${casterToken}`)
        .send({ actorId: actor2ProfileId, castingRoleId: secondaryRoleId });

      assert.equal(res.status, 409);
      assert.equal(res.body.success, false);
      assert.ok(res.body.message.includes("already exists"));
    });

    test("blocks caster from sending casting request for another caster's role with 403 Forbidden", async () => {
      const res = await request(app)
        .post("/api/casting-requests")
        .set("Authorization", `Bearer ${rivalCasterToken}`)
        .send({ actorId: actor1ProfileId, castingRoleId: openRoleId });

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
    });

    test("actor retrieves received casting requests", async () => {
      const res = await request(app)
        .get("/api/casting-requests/my-requests")
        .set("Authorization", `Bearer ${actor1Token}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.requests.some((r: any) => r.id === directRequestId));
      const reqItem = res.body.data.requests.find((r: any) => r.id === directRequestId);
      assert.equal(reqItem.caster.displayName, "Paramount Productions");
    });

    test("caster retrieves sent casting requests", async () => {
      const res = await request(app)
        .get("/api/casting-requests/sent")
        .set("Authorization", `Bearer ${casterToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.requests.some((r: any) => r.id === directRequestId));
      assert.ok(res.body.data.requests.some((r: any) => r.id === roleRequestId));
    });

    test("blocks caster from responding to their own casting request with 403 Forbidden", async () => {
      const res = await request(app)
        .patch(`/api/casting-requests/${directRequestId}/respond`)
        .set("Authorization", `Bearer ${casterToken}`)
        .send({ status: "ACCEPTED" });

      assert.equal(res.status, 403);
    });

    test("recipient actor accepts casting request and caster receives notification", async () => {
      const res = await request(app)
        .patch(`/api/casting-requests/${directRequestId}/respond`)
        .set("Authorization", `Bearer ${actor1Token}`)
        .send({ status: "ACCEPTED" });

      assert.equal(res.status, 200);
      assert.equal(res.body.data.status, "ACCEPTED");

      // Verify caster received CASTING_REQUEST_ACCEPTED notification
      const notifRes = await request(app)
        .get("/api/notifications")
        .set("Authorization", `Bearer ${casterToken}`);

      assert.equal(notifRes.status, 200);
      const acceptedNotif = notifRes.body.data.notifications.find(
        (n: any) => n.type === "CASTING_REQUEST_ACCEPTED" && n.referenceId === directRequestId
      );
      assert.ok(acceptedNotif);
      assert.ok(acceptedNotif.message.includes("accepted"));
    });

    test("caster withdraws pending casting request", async () => {
      const res = await request(app)
        .delete(`/api/casting-requests/${roleRequestId}`)
        .set("Authorization", `Bearer ${casterToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);

      // Verify 404 upon subsequent retrieval
      const getRes = await request(app)
        .get(`/api/casting-requests/${roleRequestId}`)
        .set("Authorization", `Bearer ${casterToken}`);

      assert.equal(getRes.status, 404);
    });
  });

  // -----------------------------------------------------------
  // 6. Notifications Lifecycle & Read State
  // -----------------------------------------------------------
  describe("Notifications Lifecycle & Read State", () => {
    test("user checks unread count and marks notifications as read", async () => {
      // Check unread count
      const countRes = await request(app)
        .get("/api/notifications/unread-count")
        .set("Authorization", `Bearer ${actor1Token}`);

      assert.equal(countRes.status, 200);
      assert.ok(countRes.body.data.unreadCount >= 1);

      // Get first notification id
      const listRes = await request(app)
        .get("/api/notifications")
        .set("Authorization", `Bearer ${actor1Token}`);

      assert.equal(listRes.status, 200);
      const firstNotifId = listRes.body.data.notifications[0].id;

      // Mark single notification read
      const markRes = await request(app)
        .patch(`/api/notifications/${firstNotifId}/read`)
        .set("Authorization", `Bearer ${actor1Token}`);

      assert.equal(markRes.status, 200);
      assert.equal(markRes.body.data.isRead, true);

      // Mark all notifications read
      const markAllRes = await request(app)
        .patch("/api/notifications/mark-all-read")
        .set("Authorization", `Bearer ${actor1Token}`);

      assert.equal(markAllRes.status, 200);

      // Check unread count is now 0
      const countAfter = await request(app)
        .get("/api/notifications/unread-count")
        .set("Authorization", `Bearer ${actor1Token}`);

      assert.equal(countAfter.body.data.unreadCount, 0);
    });
  });
});
