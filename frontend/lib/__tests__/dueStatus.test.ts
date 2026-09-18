import { describe, expect, it } from "vitest";
import { classifyDueDate } from "../dueStatus";

describe("classifyDueDate", () => {
  const now = new Date("2026-01-15T12:00:00Z");

  it("returns null when there is no due date", () => {
    expect(classifyDueDate(null, now)).toBeNull();
  });

  it("classifies a past date as OVERDUE", () => {
    expect(classifyDueDate("2026-01-14T12:00:00Z", now)).toBe("OVERDUE");
  });

  it("classifies a date within 24h as DUE_SOON", () => {
    expect(classifyDueDate("2026-01-16T06:00:00Z", now)).toBe("DUE_SOON");
  });

  it("classifies a date beyond 24h as UPCOMING", () => {
    expect(classifyDueDate("2026-02-01T00:00:00Z", now)).toBe("UPCOMING");
  });
});
