import { describe, expect, it } from "vitest";
import { cardMatchesFilters, defaultFilters, isFiltersActive, UNASSIGNED } from "../filters";
import type { Card } from "../types";

function makeCard(overrides: Partial<Card> = {}): Card {
  return {
    id: "card-1",
    columnId: "col-1",
    title: "Fix login bug",
    details: "Users cannot log in on Safari",
    position: 0,
    dueDate: null,
    assigneeId: null,
    assignee: null,
    labels: [],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("isFiltersActive", () => {
  it("is false for the default filters", () => {
    expect(isFiltersActive(defaultFilters)).toBe(false);
  });

  it("is true when any field is set", () => {
    expect(isFiltersActive({ ...defaultFilters, search: "bug" })).toBe(true);
    expect(isFiltersActive({ ...defaultFilters, labelIds: ["l1"] })).toBe(true);
    expect(isFiltersActive({ ...defaultFilters, assigneeId: "u1" })).toBe(true);
    expect(isFiltersActive({ ...defaultFilters, dueStatus: "OVERDUE" })).toBe(true);
  });
});

describe("cardMatchesFilters", () => {
  it("matches on title or details text, case-insensitively", () => {
    const card = makeCard();
    expect(cardMatchesFilters(card, { ...defaultFilters, search: "LOGIN" })).toBe(true);
    expect(cardMatchesFilters(card, { ...defaultFilters, search: "safari" })).toBe(true);
    expect(cardMatchesFilters(card, { ...defaultFilters, search: "billing" })).toBe(false);
  });

  it("matches when the card has any of the selected labels", () => {
    const card = makeCard({ labels: [{ id: "l1", name: "Bug", color: "#e5484d", createdAt: "" }] });
    expect(cardMatchesFilters(card, { ...defaultFilters, labelIds: ["l1", "l2"] })).toBe(true);
    expect(cardMatchesFilters(card, { ...defaultFilters, labelIds: ["l2"] })).toBe(false);
  });

  it("matches a specific assignee", () => {
    const card = makeCard({ assigneeId: "u1" });
    expect(cardMatchesFilters(card, { ...defaultFilters, assigneeId: "u1" })).toBe(true);
    expect(cardMatchesFilters(card, { ...defaultFilters, assigneeId: "u2" })).toBe(false);
  });

  it("matches the unassigned sentinel only for cards with no assignee", () => {
    expect(cardMatchesFilters(makeCard({ assigneeId: null }), { ...defaultFilters, assigneeId: UNASSIGNED })).toBe(
      true,
    );
    expect(cardMatchesFilters(makeCard({ assigneeId: "u1" }), { ...defaultFilters, assigneeId: UNASSIGNED })).toBe(
      false,
    );
  });

  it("matches due-status filters against the card's due date", () => {
    const now = new Date("2026-01-15T12:00:00Z");
    const overdue = makeCard({ dueDate: "2026-01-14T12:00:00Z" });
    const dueSoon = makeCard({ dueDate: "2026-01-16T00:00:00Z" });
    const upcoming = makeCard({ dueDate: "2026-02-01T00:00:00Z" });

    expect(cardMatchesFilters(overdue, { ...defaultFilters, dueStatus: "OVERDUE" }, now)).toBe(true);
    expect(cardMatchesFilters(dueSoon, { ...defaultFilters, dueStatus: "OVERDUE" }, now)).toBe(false);
    expect(cardMatchesFilters(dueSoon, { ...defaultFilters, dueStatus: "DUE_SOON" }, now)).toBe(true);
    expect(cardMatchesFilters(upcoming, { ...defaultFilters, dueStatus: "DUE_SOON" }, now)).toBe(false);
  });

  it("excludes cards without a due date when a due-status filter is active", () => {
    const card = makeCard({ dueDate: null });
    expect(cardMatchesFilters(card, { ...defaultFilters, dueStatus: "OVERDUE" })).toBe(false);
  });

  it("combines multiple active filters with AND semantics", () => {
    const card = makeCard({
      assigneeId: "u1",
      labels: [{ id: "l1", name: "Bug", color: "#e5484d", createdAt: "" }],
    });
    expect(
      cardMatchesFilters(card, { ...defaultFilters, search: "login", assigneeId: "u1", labelIds: ["l1"] }),
    ).toBe(true);
    expect(
      cardMatchesFilters(card, { ...defaultFilters, search: "login", assigneeId: "u2", labelIds: ["l1"] }),
    ).toBe(false);
  });
});
