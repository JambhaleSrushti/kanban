"use client";

import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";
import { useActingUser } from "../../hooks/useActingUser";
import { useCreateUser } from "../../hooks/useUsers";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Avatar } from "./Avatar";

export function UserSwitcher() {
  const { actingUser, users, setActingUser } = useActingUser();
  const createUser = useCreateUser();
  const [newName, setNewName] = useState("");
  const [open, setOpen] = useState(false);

  if (!actingUser) return null;

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    createUser.mutate(name, {
      onSuccess: (user) => {
        setActingUser(user);
        setNewName("");
      },
    });
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button className="flex items-center gap-2 rounded-md border border-border bg-surface px-2 py-1 text-sm hover:bg-border/40">
          <Avatar name={actingUser.name} size={22} />
          <span className="font-medium">{actingUser.name}</span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={6}
          className="z-50 w-60 rounded-md border border-border bg-surface p-2 shadow-lg"
        >
          <div className="px-1 pb-1 text-xs font-medium uppercase text-gray-text">Acting as</div>
          <div className="flex flex-col gap-0.5">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => {
                  setActingUser(user);
                  setOpen(false);
                }}
                className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-border/40 ${
                  user.id === actingUser.id ? "bg-border/30" : ""
                }`}
              >
                <Avatar name={user.name} size={20} />
                {user.name}
              </button>
            ))}
          </div>
          <div className="my-2 h-px bg-border" />
          <div className="flex items-center gap-1">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Add person"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdd();
                }
              }}
            />
            <Button variant="secondary" onClick={handleAdd} disabled={!newName.trim()}>
              Add
            </Button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
