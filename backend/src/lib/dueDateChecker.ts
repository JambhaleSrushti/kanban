import { classifyDueDate } from "./dueDates.js";
import { prisma } from "./prisma.js";

/**
 * Scans assigned, due cards and creates DUE_SOON/OVERDUE notifications.
 * Cards in the last ("done") column are skipped so completed work never notifies.
 * Idempotent: won't duplicate a (card, user, type) notification that already exists.
 */
export async function checkDueDates(now: Date = new Date()) {
  const board = await prisma.board.findFirst({
    include: { columns: { orderBy: { position: "asc" } } },
  });
  if (!board || board.columns.length === 0) return;

  const lastColumnId = board.columns[board.columns.length - 1].id;

  const cards = await prisma.card.findMany({
    where: { dueDate: { not: null }, assigneeId: { not: null }, columnId: { not: lastColumnId } },
  });

  for (const card of cards) {
    if (!card.dueDate || !card.assigneeId) continue;
    const status = classifyDueDate(card.dueDate, now);
    if (!status) continue;

    const existing = await prisma.notification.findFirst({
      where: { cardId: card.id, userId: card.assigneeId, type: status },
    });
    if (existing) continue;

    const message = status === "OVERDUE" ? `"${card.title}" is overdue` : `"${card.title}" is due soon`;

    await prisma.notification.create({
      data: { userId: card.assigneeId, type: status, cardId: card.id, message },
    });
  }
}

export function startDueDateChecker(intervalMs = 5 * 60 * 1000) {
  void checkDueDates();
  return setInterval(() => void checkDueDates(), intervalMs);
}
