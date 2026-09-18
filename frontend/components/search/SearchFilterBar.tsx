"use client";

import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";
import { useActingUser } from "../../hooks/useActingUser";
import { useLabels } from "../../hooks/useLabels";
import { defaultFilters, isFiltersActive, UNASSIGNED, type BoardFilters } from "../../lib/filters";
import { LabelChip } from "../labels/LabelChip";
import { Input } from "../ui/Input";
import { Avatar } from "../users/Avatar";

const DUE_STATUSES = [
  { value: "OVERDUE", label: "Overdue" },
  { value: "DUE_SOON", label: "Due soon" },
] as const;

export function SearchFilterBar({
  filters,
  onChange,
}: {
  filters: BoardFilters;
  onChange: (filters: BoardFilters) => void;
}) {
  const { data: labels = [] } = useLabels();
  const { users } = useActingUser();
  const [open, setOpen] = useState(false);

  const toggleLabel = (labelId: string) => {
    const labelIds = filters.labelIds.includes(labelId)
      ? filters.labelIds.filter((id) => id !== labelId)
      : [...filters.labelIds, labelId];
    onChange({ ...filters, labelIds });
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        placeholder="Search cards..."
        className="w-56"
      />
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm hover:bg-border/40">
            Filter{isFiltersActive(filters) ? " •" : ""}
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={6}
            className="z-50 w-64 rounded-md border border-border bg-surface p-3 shadow-lg"
          >
            <div className="mb-1 text-xs font-medium uppercase text-gray-text">Labels</div>
            <div className="mb-3 flex flex-wrap gap-1">
              {labels.map((label) => (
                <button
                  key={label.id}
                  onClick={() => toggleLabel(label.id)}
                  className={`rounded-full ${filters.labelIds.includes(label.id) ? "ring-2 ring-blue-primary" : ""}`}
                >
                  <LabelChip label={label} />
                </button>
              ))}
              {labels.length === 0 && <span className="text-sm text-gray-text">No labels yet</span>}
            </div>

            <div className="mb-1 text-xs font-medium uppercase text-gray-text">Assignee</div>
            <div className="mb-3 flex flex-col gap-1">
              <button
                onClick={() =>
                  onChange({ ...filters, assigneeId: filters.assigneeId === UNASSIGNED ? null : UNASSIGNED })
                }
                className={`flex items-center rounded px-2 py-1 text-left text-sm hover:bg-border/40 ${
                  filters.assigneeId === UNASSIGNED ? "bg-border/30" : ""
                }`}
              >
                Unassigned
              </button>
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => onChange({ ...filters, assigneeId: filters.assigneeId === user.id ? null : user.id })}
                  className={`flex items-center gap-2 rounded px-2 py-1 text-left text-sm hover:bg-border/40 ${
                    filters.assigneeId === user.id ? "bg-border/30" : ""
                  }`}
                >
                  <Avatar name={user.name} size={18} />
                  {user.name}
                </button>
              ))}
            </div>

            <div className="mb-1 text-xs font-medium uppercase text-gray-text">Due</div>
            <div className="flex gap-1">
              {DUE_STATUSES.map((status) => (
                <button
                  key={status.value}
                  onClick={() =>
                    onChange({ ...filters, dueStatus: filters.dueStatus === status.value ? "any" : status.value })
                  }
                  className={`rounded-md border border-border px-2 py-1 text-xs hover:bg-border/40 ${
                    filters.dueStatus === status.value ? "bg-border/30" : ""
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>

            {isFiltersActive(filters) && (
              <button
                onClick={() => onChange(defaultFilters)}
                className="mt-3 text-xs text-blue-primary hover:underline"
              >
                Clear all filters
              </button>
            )}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      {isFiltersActive(filters) && (
        <button onClick={() => onChange(defaultFilters)} className="text-xs text-gray-text hover:underline">
          Clear
        </button>
      )}
    </div>
  );
}
