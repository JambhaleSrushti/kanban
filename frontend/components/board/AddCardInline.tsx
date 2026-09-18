"use client";

import { useState } from "react";
import { useCreateCard } from "../../hooks/useCards";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

export function AddCardInline({ columnId }: { columnId: string }) {
  const createCard = useCreateCard();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");

  const submit = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setAdding(false);
      return;
    }
    createCard.mutate({ columnId, title: trimmed }, { onSuccess: () => setTitle("") });
  };

  if (!adding) {
    return (
      <button
        onClick={() => setAdding(true)}
        className="m-2 rounded-md px-2 py-1.5 text-left text-sm text-gray-text hover:bg-border/40"
      >
        + Add card
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 p-2">
      <Input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Card title"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
          if (e.key === "Escape") {
            setTitle("");
            setAdding(false);
          }
        }}
      />
      <div className="flex gap-1.5">
        <Button variant="secondary" onClick={submit}>
          Add
        </Button>
        <Button variant="ghost" onClick={() => setAdding(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
