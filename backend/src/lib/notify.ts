import { prisma } from "./prisma.js";

/** Notifies a newly-assigned user, skipping self-assignment. */
export async function notifyAssigned(
  cardId: string,
  cardTitle: string,
  assigneeId: string,
  actingUserId: string | undefined,
) {
  if (assigneeId === actingUserId) return;
  await prisma.notification.create({
    data: {
      userId: assigneeId,
      type: "ASSIGNED",
      cardId,
      message: `You were assigned to "${cardTitle}"`,
    },
  });
}
