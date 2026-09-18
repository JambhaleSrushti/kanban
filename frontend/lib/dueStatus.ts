const DAY_MS = 24 * 60 * 60 * 1000;

export type DueStatus = "OVERDUE" | "DUE_SOON" | "UPCOMING" | null;

/** Classifies a card's due date relative to `now`, mirroring the backend's notification logic. */
export function classifyDueDate(dueDate: string | null, now: Date = new Date()): DueStatus {
  if (!dueDate) return null;
  const diff = new Date(dueDate).getTime() - now.getTime();
  if (diff < 0) return "OVERDUE";
  if (diff <= DAY_MS) return "DUE_SOON";
  return "UPCOMING";
}
