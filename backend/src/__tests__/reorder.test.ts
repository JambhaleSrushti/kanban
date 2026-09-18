import { describe, expect, it } from "vitest";
import { reorderIds } from "../lib/reorder.js";

describe("reorderIds", () => {
  it("moves an existing id to a later index", () => {
    expect(reorderIds(["a", "b", "c"], "a", 2)).toEqual(["b", "c", "a"]);
  });

  it("moves an existing id to an earlier index", () => {
    expect(reorderIds(["a", "b", "c"], "c", 0)).toEqual(["c", "a", "b"]);
  });

  it("inserts a new id (cross-column move) at the target index", () => {
    expect(reorderIds(["a", "b"], "z", 1)).toEqual(["a", "z", "b"]);
  });

  it("inserts a new id at the end when index is out of bounds", () => {
    expect(reorderIds(["a", "b"], "z", 99)).toEqual(["a", "b", "z"]);
  });

  it("clamps a negative index to the start", () => {
    expect(reorderIds(["a", "b"], "b", -5)).toEqual(["b", "a"]);
  });

  it("handles moving into an empty list", () => {
    expect(reorderIds([], "a", 0)).toEqual(["a"]);
  });

  it("is a no-op reorder when the id is already at that index", () => {
    expect(reorderIds(["a", "b", "c"], "b", 1)).toEqual(["a", "b", "c"]);
  });
});
