"use client";

import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";
import { useCreateLabel, useDeleteLabel, useLabels, useUpdateLabel } from "../../hooks/useLabels";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { LabelChip } from "./LabelChip";

const PALETTE = ["#e5484d", "#209dd7", "#ecad0a", "#753991", "#032147", "#888888", "#0e9f6e", "#b91c1c"];

export function LabelManager() {
  const { data: labels = [] } = useLabels();
  const createLabel = useCreateLabel();
  const updateLabel = useUpdateLabel();
  const deleteLabel = useDeleteLabel();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(PALETTE[0]);

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    createLabel.mutate({ name: trimmed, color }, { onSuccess: () => setName("") });
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button className="rounded-md border border-border bg-surface px-2 py-1 text-sm hover:bg-border/40">
          Labels
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-50 w-72 rounded-md border border-border bg-surface p-3 shadow-lg"
        >
          <div className="mb-2 text-xs font-medium uppercase text-gray-text">Manage labels</div>
          <div className="mb-3 flex flex-col gap-1.5">
            {labels.map((label) => (
              <div key={label.id} className="flex items-center justify-between gap-2">
                <LabelChip label={label} />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    defaultValue={label.name}
                    onBlur={(e) => {
                      const value = e.target.value.trim();
                      if (value && value !== label.name) updateLabel.mutate({ id: label.id, name: value });
                    }}
                    className="w-20 rounded border border-border bg-surface px-1 py-0.5 text-xs"
                  />
                  <button onClick={() => deleteLabel.mutate(label.id)} className="text-xs text-red-600 hover:underline">
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {labels.length === 0 && <div className="text-sm text-gray-text">No labels yet</div>}
          </div>
          <div className="mb-2 flex flex-wrap gap-1">
            {PALETTE.map((swatch) => (
              <button
                key={swatch}
                onClick={() => setColor(swatch)}
                className={`h-5 w-5 rounded-full border-2 ${color === swatch ? "border-foreground" : "border-transparent"}`}
                style={{ backgroundColor: swatch }}
                aria-label={`Choose ${swatch}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-1">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="New label"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreate();
                }
              }}
            />
            <Button variant="secondary" onClick={handleCreate} disabled={!name.trim()}>
              Add
            </Button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
