import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const router = Router();

const hexColor = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, "color must be a hex string like #209dd7");

const createLabelSchema = z.object({
  name: z.string().trim().min(1).max(40),
  color: hexColor,
});

const updateLabelSchema = z.object({
  name: z.string().trim().min(1).max(40).optional(),
  color: hexColor.optional(),
});

router.get("/", async (_req, res) => {
  const labels = await prisma.label.findMany({ orderBy: { createdAt: "asc" } });
  res.json(labels);
});

router.post("/", async (req, res) => {
  const parsed = createLabelSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request" });
    return;
  }

  try {
    const label = await prisma.label.create({ data: parsed.data });
    res.status(201).json(label);
  } catch {
    res.status(400).json({ error: "A label with that name already exists" });
  }
});

router.patch("/:id", async (req, res) => {
  const parsed = updateLabelSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request" });
    return;
  }

  try {
    const label = await prisma.label.update({ where: { id: req.params.id }, data: parsed.data });
    res.json(label);
  } catch {
    res.status(404).json({ error: "Label not found" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await prisma.label.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch {
    res.status(404).json({ error: "Label not found" });
  }
});

export default router;
