import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import { prisma } from "../lib/prisma.js";
import { resetDb } from "./testHelpers.js";

const app = createApp();

describe("notifications routes", () => {
  beforeEach(resetDb);

  it("requires X-User-Id header", async () => {
    const res = await request(app).get("/api/notifications");
    expect(res.status).toBe(400);
  });

  it("lists only the acting user's notifications", async () => {
    const user = await prisma.user.create({ data: { name: "Sam" } });
    const other = await prisma.user.create({ data: { name: "Ash" } });
    await prisma.notification.create({ data: { userId: user.id, type: "ASSIGNED", message: "for sam" } });
    await prisma.notification.create({ data: { userId: other.id, type: "ASSIGNED", message: "for ash" } });

    const res = await request(app).get("/api/notifications").set("X-User-Id", user.id);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].message).toBe("for sam");
  });

  it("marks a notification read", async () => {
    const user = await prisma.user.create({ data: { name: "Sam" } });
    const notification = await prisma.notification.create({
      data: { userId: user.id, type: "ASSIGNED", message: "hi" },
    });

    const res = await request(app)
      .patch(`/api/notifications/${notification.id}`)
      .set("X-User-Id", user.id)
      .send({ read: true });
    expect(res.status).toBe(200);

    const updated = await prisma.notification.findUniqueOrThrow({ where: { id: notification.id } });
    expect(updated.read).toBe(true);
  });

  it("marks all notifications read", async () => {
    const user = await prisma.user.create({ data: { name: "Sam" } });
    await prisma.notification.create({ data: { userId: user.id, type: "DUE_SOON", message: "a" } });
    await prisma.notification.create({ data: { userId: user.id, type: "OVERDUE", message: "b" } });

    const res = await request(app).post("/api/notifications/read-all").set("X-User-Id", user.id);
    expect(res.status).toBe(200);

    const unread = await prisma.notification.count({ where: { userId: user.id, read: false } });
    expect(unread).toBe(0);
  });
});
