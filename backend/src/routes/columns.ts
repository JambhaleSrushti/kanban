import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const router = Router();

const renameSchema = z.object({ name: z.string().trim().min(1).max(60) });

router.patch("/:id", async (req, res) => {
  const parsed = renameSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request" });
    return;
  }

  try {
    const column = await prisma.column.update({
      where: { id: req.params.id },
      data: { name: parsed.data.name },
    });
    res.json(column);
  } catch {
    res.status(404).json({ error: "Column not found" });
  }
});

export default router;
