import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import { prisma } from "../lib/prisma.js";
import { resetDb, seedBoard } from "./testHelpers.js";

const app = createApp();

describe("cards routes", () => {
  let columns: Awaited<ReturnType<typeof seedBoard>>["columns"];

  beforeEach(async () => {
    await resetDb();
    ({ columns } = await seedBoard());
  });

  it("creates a card in a column", async () => {
    const res = await request(app)
      .post("/api/cards")
      .send({ columnId: columns[0].id, title: "New card", details: "details" });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("New card");
    expect(res.body.position).toBe(0);
    expect(res.body.labels).toEqual([]);
  });

  it("rejects a card for a missing column", async () => {
    const res = await request(app).post("/api/cards").send({ columnId: "missing", title: "x" });
    expect(res.status).toBe(404);
  });

  it("updates a card's title and details", async () => {
    const created = await prisma.card.create({
      data: { columnId: columns[0].id, title: "Old", details: "d", position: 0 },
    });
    const res = await request(app).patch(`/api/cards/${created.id}`).send({ title: "New title" });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("New title");
  });

  it("deletes a card", async () => {
    const created = await prisma.card.create({
      data: { columnId: columns[0].id, title: "Gone", details: "", position: 0 },
    });
    const res = await request(app).delete(`/api/cards/${created.id}`);
    expect(res.status).toBe(204);
    const found = await prisma.card.findUnique({ where: { id: created.id } });
    expect(found).toBeNull();
  });

  it("moves a card within a column and reindexes positions", async () => {
    const a = await prisma.card.create({ data: { columnId: columns[0].id, title: "A", details: "", position: 0 } });
    const b = await prisma.card.create({ data: { columnId: columns[0].id, title: "B", details: "", position: 1 } });
    const c = await prisma.card.create({ data: { columnId: columns[0].id, title: "C", details: "", position: 2 } });

    const res = await request(app).post(`/api/cards/${a.id}/move`).send({ columnId: columns[0].id, position: 2 });
    expect(res.status).toBe(200);

    const ordered = await prisma.card.findMany({ where: { columnId: columns[0].id }, orderBy: { position: "asc" } });
    expect(ordered.map((card) => card.id)).toEqual([b.id, c.id, a.id]);
  });

  it("moves a card across columns and reindexes both sides", async () => {
    const a = await prisma.card.create({ data: { columnId: columns[0].id, title: "A", details: "", position: 0 } });
    const b = await prisma.card.create({ data: { columnId: columns[0].id, title: "B", details: "", position: 1 } });
    const target = await prisma.card.create({
      data: { columnId: columns[1].id, title: "T", details: "", position: 0 },
    });

    const res = await request(app).post(`/api/cards/${a.id}/move`).send({ columnId: columns[1].id, position: 0 });
    expect(res.status).toBe(200);
    expect(res.body.columnId).toBe(columns[1].id);

    const source = await prisma.card.findMany({ where: { columnId: columns[0].id }, orderBy: { position: "asc" } });
    expect(source.map((card) => card.id)).toEqual([b.id]);
    expect(source[0].position).toBe(0);

    const dest = await prisma.card.findMany({ where: { columnId: columns[1].id }, orderBy: { position: "asc" } });
    expect(dest.map((card) => card.id)).toEqual([a.id, target.id]);
  });

  it("attaches and detaches a label", async () => {
    const card = await prisma.card.create({ data: { columnId: columns[0].id, title: "L", details: "", position: 0 } });
    const label = await prisma.label.create({ data: { name: "Bug", color: "#e5484d" } });

    const attachRes = await request(app).post(`/api/cards/${card.id}/labels`).send({ labelId: label.id });
    expect(attachRes.status).toBe(200);
    expect(attachRes.body.labels).toHaveLength(1);

    const detachRes = await request(app).delete(`/api/cards/${card.id}/labels/${label.id}`);
    expect(detachRes.status).toBe(200);
    expect(detachRes.body.labels).toHaveLength(0);
  });

  it("creates an ASSIGNED notification when a card is assigned to someone else", async () => {
    const user = await prisma.user.create({ data: { name: "Priya" } });
    const card = await prisma.card.create({
      data: { columnId: columns[0].id, title: "Assign me", details: "", position: 0 },
    });

    const res = await request(app)
      .patch(`/api/cards/${card.id}`)
      .set("X-User-Id", "someone-else")
      .send({ assigneeId: user.id });
    expect(res.status).toBe(200);

    const notifications = await prisma.notification.findMany({ where: { userId: user.id } });
    expect(notifications).toHaveLength(1);
    expect(notifications[0].type).toBe("ASSIGNED");
  });

  it("does not notify on self-assignment", async () => {
    const user = await prisma.user.create({ data: { name: "Priya" } });
    const card = await prisma.card.create({
      data: { columnId: columns[0].id, title: "Self", details: "", position: 0 },
    });

    await request(app).patch(`/api/cards/${card.id}`).set("X-User-Id", user.id).send({ assigneeId: user.id });

    const notifications = await prisma.notification.findMany({ where: { userId: user.id } });
    expect(notifications).toHaveLength(0);
  });
});
