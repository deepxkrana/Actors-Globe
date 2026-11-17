import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../app.js";
import prisma from "../config/prisma.js";

process.env.NODE_ENV = "test";

describe("Media and Portfolios Phase 4 Tests", () => {
  const timestamp = Date.now();
  const actorUser = {
    name: "Media Actor",
    email: `media_actor_${timestamp}@example.com`,
    phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
    password: "Password123!",
    role: "ACTOR" as const
  };

  const secondActorUser = {
    name: "Second Media Actor",
    email: `media_actor2_${timestamp}@example.com`,
    phone: `8${Math.floor(100000000 + Math.random() * 900000000)}`,
    password: "Password123!",
    role: "ACTOR" as const
  };

  const casterUser = {
    name: "Media Caster",
    email: `media_caster_${timestamp}@example.com`,
    phone: `7${Math.floor(100000000 + Math.random() * 900000000)}`,
    password: "Password123!",
    role: "CASTER" as const
  };

  let actorToken = "";
  let secondActorToken = "";
  let casterToken = "";
  let actorProfileId = "";
  let uploadedPhotoId = "";
  let uploadedVideoId = "";

  before(async () => {
    // Register users
    const actorRes = await request(app).post("/api/auth/register").send(actorUser);
    actorToken = actorRes.body.token;

    const actor2Res = await request(app).post("/api/auth/register").send(secondActorUser);
    secondActorToken = actor2Res.body.token;

    const casterRes = await request(app).post("/api/auth/register").send(casterUser);
    casterToken = casterRes.body.token;

    // Create actor profiles
    const profRes = await request(app)
      .post("/api/profiles/actor")
      .set("Authorization", `Bearer ${actorToken}`)
      .send({
        displayName: "Media Star Actor",
        dateOfBirth: "1996-07-20",
        gender: "MALE",
        sexualOrientation: "STRAIGHT"
      });
    actorProfileId = profRes.body.profile.id;

    await request(app)
      .post("/api/profiles/actor")
      .set("Authorization", `Bearer ${secondActorToken}`)
      .send({
        displayName: "Second Media Star",
        dateOfBirth: "1998-03-10",
        gender: "FEMALE",
        sexualOrientation: "OTHER"
      });
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

  describe("Upload Validation & Access Boundaries", () => {
    test("rejects upload without authentication with 401 Unauthorized", async () => {
      const res = await request(app)
        .post("/api/media")
        .attach("file", Buffer.from("fake-image"), "test.jpg")
        .field("type", "PHOTO");

      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
    });

    test("blocks CASTER from uploading media with 403 Forbidden", async () => {
      const res = await request(app)
        .post("/api/media")
        .set("Authorization", `Bearer ${casterToken}`)
        .attach("file", Buffer.from("fake-image"), "test.jpg")
        .field("type", "PHOTO");

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
    });

    test("rejects request with missing file with 400 Bad Request", async () => {
      const res = await request(app)
        .post("/api/media")
        .set("Authorization", `Bearer ${actorToken}`)
        .field("type", "PHOTO");

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes("No file uploaded"));
    });

    test("rejects file with invalid MIME type", async () => {
      const res = await request(app)
        .post("/api/media")
        .set("Authorization", `Bearer ${actorToken}`)
        .attach("file", Buffer.from("%PDF-1.4..."), "document.pdf")
        .field("type", "PHOTO");

      assert.strictEqual(res.status, 500); // Multer fileFilter error handled by error handler
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes("Invalid file type"));
    });
  });

  describe("Photo & Video Upload Operations", () => {
    test("successfully uploads a photo", async () => {
      // Sample 1x1 transparent GIF / JPEG mock buffer
      const mockImageBuffer = Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01
      ]);

      const res = await request(app)
        .post("/api/media")
        .set("Authorization", `Bearer ${actorToken}`)
        .attach("file", mockImageBuffer, "headshot.jpg")
        .field("type", "PHOTO");

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.media.type, "PHOTO");
      assert.strictEqual(res.body.media.mimeType, "image/jpeg");
      assert.strictEqual(res.body.media.originalFileName, "headshot.jpg");
      assert.ok(res.body.media.url.startsWith("/uploads/actors/"));
      assert.ok(res.body.media.storageKey.startsWith(`actors/${actorProfileId}/photo_`));

      uploadedPhotoId = res.body.media.id;
    });

    test("successfully uploads a video with duration", async () => {
      const mockVideoBuffer = Buffer.from("mock-mp4-video-stream-content");

      const res = await request(app)
        .post("/api/media")
        .set("Authorization", `Bearer ${actorToken}`)
        .attach("file", mockVideoBuffer, "showreel.mp4")
        .field("type", "VIDEO")
        .field("duration", "45");

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.media.type, "VIDEO");
      assert.strictEqual(res.body.media.mimeType, "video/mp4");
      assert.strictEqual(res.body.media.duration, 45);
      assert.ok(res.body.media.storageKey.startsWith(`actors/${actorProfileId}/video_`));

      uploadedVideoId = res.body.media.id;
    });
  });

  describe("Portfolio Listing & Filtering", () => {
    test("actor lists their own portfolio media", async () => {
      const res = await request(app)
        .get("/api/media/me")
        .set("Authorization", `Bearer ${actorToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(Array.isArray(res.body.media));
      assert.strictEqual(res.body.media.length, 2);
    });

    test("filters media by type = PHOTO", async () => {
      const res = await request(app)
        .get("/api/media/me?type=PHOTO")
        .set("Authorization", `Bearer ${actorToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.media.length, 1);
      assert.strictEqual(res.body.media[0].type, "PHOTO");
    });

    test("filters media by type = VIDEO", async () => {
      const res = await request(app)
        .get("/api/media/me?type=VIDEO")
        .set("Authorization", `Bearer ${actorToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.media.length, 1);
      assert.strictEqual(res.body.media[0].type, "VIDEO");
    });

    test("public retrieval of actor media by actor ID", async () => {
      const res = await request(app).get(`/api/media/actor/${actorProfileId}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.media.length, 2);
    });
  });

  describe("Ownership Security & Deletion", () => {
    test("blocks second actor from deleting first actor's media with 403 Forbidden", async () => {
      const res = await request(app)
        .delete(`/api/media/${uploadedPhotoId}`)
        .set("Authorization", `Bearer ${secondActorToken}`);

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes("Forbidden"));
    });

    test("actor deletes their own photo successfully", async () => {
      const res = await request(app)
        .delete(`/api/media/${uploadedPhotoId}`)
        .set("Authorization", `Bearer ${actorToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.message, "Media deleted successfully");
    });

    test("subsequent delete attempt on already deleted media returns 404", async () => {
      const res = await request(app)
        .delete(`/api/media/${uploadedPhotoId}`)
        .set("Authorization", `Bearer ${actorToken}`);

      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.body.success, false);
    });

    test("portfolio now contains only the remaining video", async () => {
      const res = await request(app)
        .get("/api/media/me")
        .set("Authorization", `Bearer ${actorToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.media.length, 1);
      assert.strictEqual(res.body.media[0].id, uploadedVideoId);
    });
  });
});
