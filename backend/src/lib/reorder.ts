/**
 * Pure reordering helper: removes `movingId` if present, then inserts it at
 * `toIndex` (clamped to the list bounds). Callers persist the result by
 * writing `position = index` for each returned id.
 */
export function reorderIds(ids: string[], movingId: string, toIndex: number): string[] {
  const withoutMoving = ids.filter((id) => id !== movingId);
  const clampedIndex = Math.max(0, Math.min(toIndex, withoutMoving.length));
  const result = [...withoutMoving];
  result.splice(clampedIndex, 0, movingId);
  return result;
}
