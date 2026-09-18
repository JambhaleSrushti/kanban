import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import { resetDb } from "./testHelpers.js";

const app = createApp();

describe("labels routes", () => {
  beforeEach(resetDb);

  it("creates and lists labels", async () => {
    const createRes = await request(app).post("/api/labels").send({ name: "Bug", color: "#e5484d" });
    expect(createRes.status).toBe(201);

    const listRes = await request(app).get("/api/labels");
    expect(listRes.status).toBe(200);
    expect(listRes.body).toHaveLength(1);
  });

  it("rejects an invalid hex color", async () => {
    const res = await request(app).post("/api/labels").send({ name: "Bug", color: "red" });
    expect(res.status).toBe(400);
  });

  it("rejects duplicate label names", async () => {
    await request(app).post("/api/labels").send({ name: "Bug", color: "#e5484d" });
    const res = await request(app).post("/api/labels").send({ name: "Bug", color: "#209dd7" });
    expect(res.status).toBe(400);
  });

  it("updates and deletes a label", async () => {
    const createRes = await request(app).post("/api/labels").send({ name: "Bug", color: "#e5484d" });
    const id = createRes.body.id;

    const updateRes = await request(app).patch(`/api/labels/${id}`).send({ name: "Defect" });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.name).toBe("Defect");

    const deleteRes = await request(app).delete(`/api/labels/${id}`);
    expect(deleteRes.status).toBe(204);
  });
});
