"use client";

import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";
import type { User } from "../../lib/types";
import { Avatar } from "./Avatar";

export function AssigneePicker({
  users,
  assignee,
  onChange,
}: {
  users: User[];
  assignee: User | null;
  onChange: (userId: string | null) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button className="flex items-center gap-2 rounded-md border border-border bg-surface px-2 py-1 text-sm hover:bg-border/40">
          {assignee ? (
            <>
              <Avatar name={assignee.name} size={20} />
              {assignee.name}
            </>
          ) : (
            <span className="text-gray-text">Unassigned</span>
          )}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-50 w-48 rounded-md border border-border bg-surface p-1 shadow-lg"
        >
          <button
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
            className="flex w-full items-center rounded px-2 py-1.5 text-left text-sm text-gray-text hover:bg-border/40"
          >
            Unassigned
          </button>
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => {
                onChange(user.id);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-border/40 ${
                assignee?.id === user.id ? "bg-border/30" : ""
              }`}
            >
              <Avatar name={user.name} size={20} />
              {user.name}
            </button>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
