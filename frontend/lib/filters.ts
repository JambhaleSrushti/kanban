import { classifyDueDate } from "./dueStatus";
import type { Card } from "./types";

export const UNASSIGNED = "unassigned";

export type BoardFilters = {
  search: string;
  labelIds: string[];
  assigneeId: string | null;
  dueStatus: "any" | "OVERDUE" | "DUE_SOON";
};

export const defaultFilters: BoardFilters = {
  search: "",
  labelIds: [],
  assigneeId: null,
  dueStatus: "any",
};

export function isFiltersActive(filters: BoardFilters): boolean {
  return (
    filters.search.trim() !== "" ||
    filters.labelIds.length > 0 ||
    filters.assigneeId !== null ||
    filters.dueStatus !== "any"
  );
}

export function cardMatchesFilters(card: Card, filters: BoardFilters, now: Date = new Date()): boolean {
  const search = filters.search.trim().toLowerCase();
  if (search && !`${card.title} ${card.details}`.toLowerCase().includes(search)) {
    return false;
  }

  if (filters.labelIds.length > 0) {
    const cardLabelIds = new Set(card.labels.map((label) => label.id));
    if (!filters.labelIds.some((id) => cardLabelIds.has(id))) return false;
  }

  if (filters.assigneeId !== null) {
    const matchesUnassigned = filters.assigneeId === UNASSIGNED && card.assigneeId === null;
    const matchesUser = card.assigneeId === filters.assigneeId;
    if (!matchesUnassigned && !matchesUser) return false;
  }

  if (filters.dueStatus !== "any" && classifyDueDate(card.dueDate, now) !== filters.dueStatus) {
    return false;
  }

  return true;
}
