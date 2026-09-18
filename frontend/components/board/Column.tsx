"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState } from "react";
import { useRenameColumn } from "../../hooks/useColumns";
import type { Card as CardType, Column as ColumnType } from "../../lib/types";
import { AddCardInline } from "./AddCardInline";
import { Card } from "./Card";

export function Column({
  column,
  cards,
  dragDisabled,
  onOpenCard,
}: {
  column: ColumnType;
  cards: CardType[];
  dragDisabled: boolean;
  onOpenCard: (id: string) => void;
}) {
  const { setNodeRef } = useDroppable({ id: column.id, disabled: dragDisabled });
  const renameColumn = useRenameColumn();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(column.name);

  const commitRename = () => {
    setEditing(false);
    const trimmed = name.trim();
    if (trimmed && trimmed !== column.name) renameColumn.mutate({ id: column.id, name: trimmed });
    else setName(column.name);
  };

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        {editing ? (
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") {
                setName(column.name);
                setEditing(false);
              }
            }}
            className="w-full rounded border border-blue-primary bg-surface px-1 py-0.5 text-sm font-semibold text-foreground outline-none"
          />
        ) : (
          <button onClick={() => setEditing(true)} className="text-sm font-semibold text-foreground hover:underline">
            {column.name}
          </button>
        )}
        <span className="rounded-full bg-border/60 px-1.5 py-0.5 text-xs text-gray-text">{cards.length}</span>
      </div>

      <div ref={setNodeRef} className="flex min-h-[60px] flex-1 flex-col gap-2 p-2">
        <SortableContext items={cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <Card key={card.id} card={card} dragDisabled={dragDisabled} onOpen={() => onOpenCard(card.id)} />
          ))}
        </SortableContext>
      </div>

      <AddCardInline columnId={column.id} />
    </div>
  );
}
