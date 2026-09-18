import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { reorderIds } from "../lib/reorder.js";
import { cardInclude, serializeCard } from "../lib/serialize.js";
import { notifyAssigned } from "../lib/notify.js";

const router = Router();

const createCardSchema = z.object({
  columnId: z.string().min(1),
  title: z.string().trim().min(1).max(200),
  details: z.string().trim().max(4000).default(""),
  dueDate: z.string().datetime().nullish(),
  assigneeId: z.string().min(1).nullish(),
});

const updateCardSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  details: z.string().trim().max(4000).optional(),
  dueDate: z.string().datetime().nullish(),
  assigneeId: z.string().min(1).nullish(),
});

const moveCardSchema = z.object({
  columnId: z.string().min(1),
  position: z.number().int().min(0),
});

const attachLabelSchema = z.object({ labelId: z.string().min(1) });

async function assigneeExists(assigneeId: string | null | undefined) {
  if (!assigneeId) return true;
  const user = await prisma.user.findUnique({ where: { id: assigneeId } });
  return user !== null;
}

router.post("/", async (req, res) => {
  const parsed = createCardSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request" });
    return;
  }
  const { columnId, title, details, dueDate, assigneeId } = parsed.data;

  const column = await prisma.column.findUnique({ where: { id: columnId } });
  if (!column) {
    res.status(404).json({ error: "Column not found" });
    return;
  }
  if (!(await assigneeExists(assigneeId))) {
    res.status(400).json({ error: "Assignee not found" });
    return;
  }

  const cardCount = await prisma.card.count({ where: { columnId } });

  const card = await prisma.card.create({
    data: {
      columnId,
      title,
      details,
      dueDate: dueDate ? new Date(dueDate) : null,
      assigneeId: assigneeId ?? null,
      position: cardCount,
    },
    include: cardInclude,
  });

  if (card.assigneeId) {
    await notifyAssigned(card.id, card.title, card.assigneeId, req.actingUserId);
  }

  res.status(201).json(serializeCard(card));
});

router.patch("/:id", async (req, res) => {
  const parsed = updateCardSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request" });
    return;
  }

  const existing = await prisma.card.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404).json({ error: "Card not found" });
    return;
  }

  const { title, details, dueDate, assigneeId } = parsed.data;
  if (assigneeId !== undefined && !(await assigneeExists(assigneeId))) {
    res.status(400).json({ error: "Assignee not found" });
    return;
  }

  const card = await prisma.card.update({
    where: { id: req.params.id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(details !== undefined ? { details } : {}),
      ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
      ...(assigneeId !== undefined ? { assigneeId } : {}),
    },
    include: cardInclude,
  });

  const assigneeChanged = assigneeId !== undefined && assigneeId !== existing.assigneeId;
  if (assigneeChanged && card.assigneeId) {
    await notifyAssigned(card.id, card.title, card.assigneeId, req.actingUserId);
  }

  res.json(serializeCard(card));
});

router.delete("/:id", async (req, res) => {
  try {
    await prisma.card.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch {
    res.status(404).json({ error: "Card not found" });
  }
});

router.post("/:id/move", async (req, res) => {
  const parsed = moveCardSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request" });
    return;
  }
  const { columnId: targetColumnId, position } = parsed.data;
  const cardId = req.params.id;

  const movingCard = await prisma.card.findUnique({ where: { id: cardId } });
  if (!movingCard) {
    res.status(404).json({ error: "Card not found" });
    return;
  }

  const targetColumn = await prisma.column.findUnique({ where: { id: targetColumnId } });
  if (!targetColumn) {
    res.status(404).json({ error: "Target column not found" });
    return;
  }

  const sourceColumnId = movingCard.columnId;
  const sameColumn = sourceColumnId === targetColumnId;

  const targetCards = await prisma.card.findMany({
    where: { columnId: targetColumnId },
    orderBy: { position: "asc" },
    select: { id: true },
  });
  const targetOrder = reorderIds(
    targetCards.map((c) => c.id),
    cardId,
    position,
  );

  const updates = targetOrder.map((id, index) =>
    prisma.card.update({ where: { id }, data: { position: index, ...(id === cardId ? { columnId: targetColumnId } : {}) } }),
  );

  if (!sameColumn) {
    const sourceCards = await prisma.card.findMany({
      where: { columnId: sourceColumnId, id: { not: cardId } },
      orderBy: { position: "asc" },
      select: { id: true },
    });
    updates.push(
      ...sourceCards.map((c, index) => prisma.card.update({ where: { id: c.id }, data: { position: index } })),
    );
  }

  await prisma.$transaction(updates);

  const card = await prisma.card.findUniqueOrThrow({ where: { id: cardId }, include: cardInclude });
  res.json(serializeCard(card));
});

router.post("/:id/labels", async (req, res) => {
  const parsed = attachLabelSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request" });
    return;
  }

  const card = await prisma.card.findUnique({ where: { id: req.params.id } });
  if (!card) {
    res.status(404).json({ error: "Card not found" });
    return;
  }
  const label = await prisma.label.findUnique({ where: { id: parsed.data.labelId } });
  if (!label) {
    res.status(404).json({ error: "Label not found" });
    return;
  }

  await prisma.cardLabel.upsert({
    where: { cardId_labelId: { cardId: req.params.id, labelId: parsed.data.labelId } },
    update: {},
    create: { cardId: req.params.id, labelId: parsed.data.labelId },
  });

  const updated = await prisma.card.findUniqueOrThrow({ where: { id: req.params.id }, include: cardInclude });
  res.json(serializeCard(updated));
});

router.delete("/:id/labels/:labelId", async (req, res) => {
  await prisma.cardLabel.deleteMany({
    where: { cardId: req.params.id, labelId: req.params.labelId },
  });

  const updated = await prisma.card.findUnique({ where: { id: req.params.id }, include: cardInclude });
  if (!updated) {
    res.status(404).json({ error: "Card not found" });
    return;
  }
  res.json(serializeCard(updated));
});

export default router;
