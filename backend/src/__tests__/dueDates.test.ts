import { describe, expect, it } from "vitest";
import { classifyDueDate } from "../lib/dueDates.js";

describe("classifyDueDate", () => {
  const now = new Date("2026-01-15T12:00:00Z");

  it("classifies a past due date as OVERDUE", () => {
    expect(classifyDueDate(new Date("2026-01-14T12:00:00Z"), now)).toBe("OVERDUE");
  });

  it("classifies a due date within 24h as DUE_SOON", () => {
    expect(classifyDueDate(new Date("2026-01-16T06:00:00Z"), now)).toBe("DUE_SOON");
  });

  it("classifies a due date exactly 24h away as DUE_SOON", () => {
    expect(classifyDueDate(new Date("2026-01-16T12:00:00Z"), now)).toBe("DUE_SOON");
  });

  it("classifies a due date beyond 24h as null", () => {
    expect(classifyDueDate(new Date("2026-01-20T12:00:00Z"), now)).toBeNull();
  });

  it("classifies the current instant as DUE_SOON, not OVERDUE", () => {
    expect(classifyDueDate(now, now)).toBe("DUE_SOON");
  });
});
