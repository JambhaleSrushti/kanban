import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/", async (req, res) => {
  if (!req.actingUserId) {
    res.status(400).json({ error: "X-User-Id header is required" });
    return;
  }

  const unreadOnly = req.query.unreadOnly === "true";

  const notifications = await prisma.notification.findMany({
    where: { userId: req.actingUserId, ...(unreadOnly ? { read: false } : {}) },
    orderBy: { createdAt: "desc" },
  });

  res.json(notifications);
});

router.patch("/:id", async (req, res) => {
  if (!req.actingUserId) {
    res.status(400).json({ error: "X-User-Id header is required" });
    return;
  }

  const result = await prisma.notification.updateMany({
    where: { id: req.params.id, userId: req.actingUserId },
    data: { read: true },
  });

  if (result.count === 0) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }

  res.json({ success: true });
});

router.post("/read-all", async (req, res) => {
  if (!req.actingUserId) {
    res.status(400).json({ error: "X-User-Id header is required" });
    return;
  }

  await prisma.notification.updateMany({
    where: { userId: req.actingUserId, read: false },
    data: { read: true },
  });

  res.json({ success: true });
});

export default router;
