import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import request from "supertest";
import { io as Client, type Socket as ClientSocket } from "socket.io-client";
import app from "../app.js";
import prisma from "../config/prisma.js";
import { initSocketServer } from "../socket.js";

process.env.NODE_ENV = "test";

describe("Messaging and Notifications Phase 8 Tests", () => {
  const timestamp = Date.now();

  const casterUser = {
    name: "Message Caster",
    email: `msg_caster_${timestamp}@example.com`,
    phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
    password: "Password123!",
    role: "CASTER" as const
  };

  const actorUser = {
    name: "Message Actor",
    email: `msg_actor_${timestamp}@example.com`,
    phone: `8${Math.floor(100000000 + Math.random() * 900000000)}`,
    password: "Password123!",
    role: "ACTOR" as const
  };

  const unrelatedActorUser = {
    name: "Unrelated Actor",
    email: `msg_unrelated_${timestamp}@example.com`,
    phone: `7${Math.floor(100000000 + Math.random() * 900000000)}`,
    password: "Password123!",
    role: "ACTOR" as const
  };

  let casterToken = "";
  let casterUserId = "";
  let casterProfileId = "";

  let actorToken = "";
  let actorUserId = "";
  let actorProfileId = "";

  let unrelatedToken = "";
  let unrelatedUserId = "";
  let unrelatedProfileId = "";

  let conversationId = "";

  let server: http.Server;
  let serverPort = 0;

  before(async () => {
    // 1. Setup ephemeral HTTP and Socket.IO server for testing
    server = http.createServer(app);
    initSocketServer(server);
    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        const address = server.address();
        if (address && typeof address === "object") {
          serverPort = address.port;
        }
        resolve();
      });
    });

    // 2. Register users
    const cRes = await request(app).post("/api/auth/register").send(casterUser);
    casterToken = cRes.body.token;
    casterUserId = cRes.body.user.id;

    const aRes = await request(app).post("/api/auth/register").send(actorUser);
    actorToken = aRes.body.token;
    actorUserId = aRes.body.user.id;

    const uRes = await request(app).post("/api/auth/register").send(unrelatedActorUser);
    unrelatedToken = uRes.body.token;
    unrelatedUserId = uRes.body.user.id;

    // 3. Create profiles
    const cProf = await request(app)
      .post("/api/profiles/caster")
      .set("Authorization", `Bearer ${casterToken}`)
      .send({ displayName: "Cinema Scope Casting" });
    casterProfileId = cProf.body.profile.id;

    const aProf = await request(app)
      .post("/api/profiles/actor")
      .set("Authorization", `Bearer ${actorToken}`)
      .send({
        displayName: "Grace Kelly",
        dateOfBirth: "2001-08-14",
        gender: "FEMALE",
        sexualOrientation: "STRAIGHT",
        bio: "Dramatic leading lady",
        skills: ["ACTING"]
      });
    actorProfileId = aProf.body.profile.id;

    const uProf = await request(app)
      .post("/api/profiles/actor")
      .set("Authorization", `Bearer ${unrelatedToken}`)
      .send({
        displayName: "External Actor",
        dateOfBirth: "1999-04-10",
        gender: "MALE",
        sexualOrientation: "PREFER_NOT_TO_SAY",
        bio: "Unrelated actor for security isolation checks",
        skills: ["ACTING"]
      });
    unrelatedProfileId = uProf.body.profile.id;
  });

  after(async () => {
    if (server) {
      server.close();
    }
    try {
      await prisma.user.deleteMany({
        where: {
          email: {
            in: [
              casterUser.email,
              actorUser.email,
              unrelatedActorUser.email
            ]
          }
        }
      });
    } catch {
      // Ignore cleanup error
    }
  });

  // -----------------------------------------------------------
  // 1. Persistent Conversation Creation & Uniqueness
  // -----------------------------------------------------------
  describe("Conversation Creation & Uniqueness Constraints", () => {
    test("blocks unauthenticated requests to conversation creation", async () => {
      const res = await request(app)
        .post("/api/conversations")
        .send({ casterId: casterProfileId });

      assert.equal(res.status, 401);
    });

    test("actor initiates conversation with caster", async () => {
      const res = await request(app)
        .post("/api/conversations")
        .set("Authorization", `Bearer ${actorToken}`)
        .send({ casterId: casterProfileId });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.id);
      conversationId = res.body.data.id;
      assert.equal(res.body.data.actor.id, actorProfileId);
      assert.equal(res.body.data.caster.id, casterProfileId);
    });

    test("IDEMPOTENT: caster requesting conversation with same actor returns existing conversation", async () => {
      const res = await request(app)
        .post("/api/conversations")
        .set("Authorization", `Bearer ${casterToken}`)
        .send({ actorId: actorProfileId });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      // Returns the exact same conversation, preventing duplicates
      assert.equal(res.body.data.id, conversationId);
    });
  });

  // -----------------------------------------------------------
  // 2. Conversation Access & Membership Security
  // -----------------------------------------------------------
  describe("Conversation Access & Membership Authorization", () => {
    test("participant actor and caster can view conversation details", async () => {
      const resActor = await request(app)
        .get(`/api/conversations/${conversationId}`)
        .set("Authorization", `Bearer ${actorToken}`);

      assert.equal(resActor.status, 200);
      assert.equal(resActor.body.data.id, conversationId);

      const resCaster = await request(app)
        .get(`/api/conversations/${conversationId}`)
        .set("Authorization", `Bearer ${casterToken}`);

      assert.equal(resCaster.status, 200);
      assert.equal(resCaster.body.data.id, conversationId);
    });

    test("SECURITY: blocks unrelated user from accessing conversation with 403 Forbidden", async () => {
      const res = await request(app)
        .get(`/api/conversations/${conversationId}`)
        .set("Authorization", `Bearer ${unrelatedToken}`);

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.ok(res.body.message.includes("Forbidden"));
    });

    test("user lists their conversations", async () => {
      const res = await request(app)
        .get("/api/conversations")
        .set("Authorization", `Bearer ${actorToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.conversations.some((c: any) => c.id === conversationId));
    });
  });

  // -----------------------------------------------------------
  // 3. REST Messaging & PostgreSQL Persistence
  // -----------------------------------------------------------
  describe("REST Messaging & Database Persistence", () => {
    let message1Id = "";

    test("actor sends a message to caster", async () => {
      const res = await request(app)
        .post(`/api/conversations/${conversationId}/messages`)
        .set("Authorization", `Bearer ${actorToken}`)
        .send({ content: "Good afternoon, I am interested in the role." });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.content, "Good afternoon, I am interested in the role.");
      assert.equal(res.body.data.senderId, actorUserId);
      message1Id = res.body.data.id;

      // Verify recipient caster received a notification
      const notifRes = await request(app)
        .get("/api/notifications")
        .set("Authorization", `Bearer ${casterToken}`);

      assert.equal(notifRes.status, 200);
      const msgNotif = notifRes.body.data.notifications.find(
        (n: any) => n.referenceId === conversationId && n.type === "NEW_MESSAGE"
      );
      assert.ok(msgNotif);
      assert.ok(msgNotif.message.includes("Good afternoon"));
    });

    test("caster replies to actor in conversation", async () => {
      const res = await request(app)
        .post(`/api/conversations/${conversationId}/messages`)
        .set("Authorization", `Bearer ${casterToken}`)
        .send({ content: "Thank you Grace, we would love to review your reel!" });

      assert.equal(res.status, 201);
      assert.equal(res.body.data.senderId, casterUserId);

      // Verify message persists in PostgreSQL
      const persisted = await prisma.message.findUnique({
        where: { id: res.body.data.id }
      });
      assert.ok(persisted);
      assert.equal(persisted.content, "Thank you Grace, we would love to review your reel!");
    });

    test("SECURITY: blocks unrelated user from sending message to conversation with 403 Forbidden", async () => {
      const res = await request(app)
        .post(`/api/conversations/${conversationId}/messages`)
        .set("Authorization", `Bearer ${unrelatedToken}`)
        .send({ content: "Intruder attempting to post message" });

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
    });

    test("INPUT VALIDATION: rejects empty message content with 400 Bad Request", async () => {
      const res = await request(app)
        .post(`/api/conversations/${conversationId}/messages`)
        .set("Authorization", `Bearer ${actorToken}`)
        .send({ content: "   " });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });
  });

  // -----------------------------------------------------------
  // 4. Message Pagination & History Retrieval
  // -----------------------------------------------------------
  describe("Message Pagination & History Retrieval", () => {
    test("retrieves conversation messages with pagination", async () => {
      const res = await request(app)
        .get(`/api/conversations/${conversationId}/messages`)
        .set("Authorization", `Bearer ${actorToken}`)
        .query({ page: 1, limit: 10 });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.messages.length >= 2);
      assert.equal(res.body.data.pagination.page, 1);
      assert.ok(res.body.data.pagination.total >= 2);
    });

    test("SECURITY: blocks unrelated user from retrieving conversation messages with 403 Forbidden", async () => {
      const res = await request(app)
        .get(`/api/conversations/${conversationId}/messages`)
        .set("Authorization", `Bearer ${unrelatedToken}`);

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
    });
  });

  // -----------------------------------------------------------
  // 5. Real-Time Socket.IO Handshake & Room Authorization
  // -----------------------------------------------------------
  describe("Socket.IO Real-Time Authentication & Room Events", () => {
    test("rejects socket connection with missing or invalid token", async () => {
      await new Promise<void>((resolve) => {
        const clientSocket: ClientSocket = Client(`http://localhost:${serverPort}`, {
          transports: ["websocket"],
          auth: { token: "invalid_garbage_token" }
        });

        clientSocket.on("connect_error", (err) => {
          assert.ok(err.message.includes("Authentication required"));
          clientSocket.disconnect();
          resolve();
        });
      });
    });

    test("authenticates valid socket connections and permits authorized conversation room join", async () => {
      const clientActor: ClientSocket = Client(`http://localhost:${serverPort}`, {
        transports: ["websocket"],
        auth: { token: actorToken }
      });

      const clientCaster: ClientSocket = Client(`http://localhost:${serverPort}`, {
        transports: ["websocket"],
        auth: { token: casterToken }
      });

      // Wait for both sockets to connect
      await new Promise<void>((resolve) => {
        let connectedCount = 0;
        const onConnect = () => {
          connectedCount++;
          if (connectedCount === 2) resolve();
        };
        clientActor.on("connect", onConnect);
        clientCaster.on("connect", onConnect);
      });

      // 1. Join authorized conversation room
      await new Promise<void>((resolve) => {
        clientActor.emit("join_conversation", { conversationId }, (res: any) => {
          assert.equal(res.success, true);
          assert.equal(res.conversationId, conversationId);
          resolve();
        });
      });

      await new Promise<void>((resolve) => {
        clientCaster.emit("join_conversation", { conversationId }, (res: any) => {
          assert.equal(res.success, true);
          resolve();
        });
      });

      // 2. Real-time message exchange test: Caster listens, Actor sends via socket
      await new Promise<void>((resolve) => {
        clientCaster.on("new_message", (message: any) => {
          assert.equal(message.conversationId, conversationId);
          assert.equal(message.content, "Real-time socket message from Grace!");
          assert.equal(message.senderId, actorUserId);
          resolve();
        });

        clientActor.emit("send_message", {
          conversationId,
          content: "Real-time socket message from Grace!"
        });
      });

      // Disconnect clients
      clientActor.disconnect();
      clientCaster.disconnect();
    });

    test("SECURITY: blocks socket from joining a conversation room they do not belong to", async () => {
      const clientUnrelated: ClientSocket = Client(`http://localhost:${serverPort}`, {
        transports: ["websocket"],
        auth: { token: unrelatedToken }
      });

      await new Promise<void>((resolve) => {
        clientUnrelated.on("connect", () => {
          clientUnrelated.emit("join_conversation", { conversationId });
        });

        clientUnrelated.on("error", (err: any) => {
          assert.ok(err.message.includes("Forbidden"));
          clientUnrelated.disconnect();
          resolve();
        });
      });
    });
  });
});
