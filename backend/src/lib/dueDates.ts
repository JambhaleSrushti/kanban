const DAY_MS = 24 * 60 * 60 * 1000;

export type DueStatus = "DUE_SOON" | "OVERDUE" | null;

/** Classifies a due date relative to `now`: overdue, due within 24h, or neither. */
export function classifyDueDate(dueDate: Date, now: Date): DueStatus {
  const diffMs = dueDate.getTime() - now.getTime();
  if (diffMs < 0) return "OVERDUE";
  if (diffMs <= DAY_MS) return "DUE_SOON";
  return null;
}
