import { Router } from "express";
import { cardInclude, serializeCard } from "../lib/serialize.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/", async (_req, res) => {
  const board = await prisma.board.findFirst({
    include: {
      columns: {
        orderBy: { position: "asc" },
        include: {
          cards: { orderBy: { position: "asc" }, include: cardInclude },
        },
      },
    },
  });

  if (!board) {
    res.status(404).json({ error: "No board found" });
    return;
  }

  res.json({
    ...board,
    columns: board.columns.map((column) => ({
      ...column,
      cards: column.cards.map(serializeCard),
    })),
  });
});

export default router;
