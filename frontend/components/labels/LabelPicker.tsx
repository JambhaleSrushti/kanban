"use client";

import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";
import type { Label } from "../../lib/types";
import { LabelChip } from "./LabelChip";

export function LabelPicker({
  allLabels,
  selectedLabels,
  onToggle,
}: {
  allLabels: Label[];
  selectedLabels: Label[];
  onToggle: (labelId: string, attached: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedIds = new Set(selectedLabels.map((label) => label.id));

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button className="rounded-md border border-dashed border-border px-2 py-1 text-xs text-gray-text hover:bg-border/40">
          + Label
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-50 w-52 rounded-md border border-border bg-surface p-1 shadow-lg"
        >
          {allLabels.length === 0 && <div className="px-2 py-1.5 text-sm text-gray-text">No labels yet</div>}
          {allLabels.map((label) => (
            <button
              key={label.id}
              onClick={() => onToggle(label.id, selectedIds.has(label.id))}
              className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm hover:bg-border/40"
            >
              <LabelChip label={label} />
              {selectedIds.has(label.id) && <span className="text-blue-primary">✓</span>}
            </button>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
