"use client";

import { useEffect, useState } from "react";
import { useActingUser } from "../../hooks/useActingUser";
import { useAttachLabel, useDeleteCard, useDetachLabel, useUpdateCard } from "../../hooks/useCards";
import { useLabels } from "../../hooks/useLabels";
import type { Card } from "../../lib/types";
import { LabelChip } from "../labels/LabelChip";
import { LabelPicker } from "../labels/LabelPicker";
import { Textarea } from "../ui/Input";
import { AssigneePicker } from "../users/AssigneePicker";

export function CardDetailPanel({ card, onClose }: { card: Card; onClose: () => void }) {
  const { users } = useActingUser();
  const { data: allLabels = [] } = useLabels();
  const updateCard = useUpdateCard();
  const deleteCard = useDeleteCard();
  const attachLabel = useAttachLabel();
  const detachLabel = useDetachLabel();

  // Initialized once per card: the caller remounts this component with
  // `key={card.id}` when switching cards, so no re-sync effect is needed.
  const [title, setTitle] = useState(card.title);
  const [details, setDetails] = useState(card.details);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const commitTitle = () => {
    const trimmed = title.trim();
    if (trimmed && trimmed !== card.title) updateCard.mutate({ id: card.id, title: trimmed });
    else setTitle(card.title);
  };

  const commitDetails = () => {
    if (details !== card.details) updateCard.mutate({ id: card.id, details });
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/10" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 flex h-full w-96 flex-col gap-4 overflow-y-auto border-l border-border bg-surface p-4 shadow-xl">
        <div className="flex items-start justify-between gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
            className="flex-1 rounded border border-transparent bg-transparent text-lg font-semibold text-foreground outline-none hover:border-border focus:border-blue-primary"
          />
          <button onClick={onClose} className="text-gray-text hover:text-foreground" aria-label="Close">
            ×
          </button>
        </div>

        <div>
          <div className="mb-1 text-xs font-medium uppercase text-gray-text">Details</div>
          <Textarea rows={5} value={details} onChange={(e) => setDetails(e.target.value)} onBlur={commitDetails} />
        </div>

        <div>
          <div className="mb-1 text-xs font-medium uppercase text-gray-text">Assignee</div>
          <AssigneePicker
            users={users}
            assignee={card.assignee}
            onChange={(assigneeId) => updateCard.mutate({ id: card.id, assigneeId })}
          />
        </div>

        <div>
          <div className="mb-1 text-xs font-medium uppercase text-gray-text">Due date</div>
          <input
            type="date"
            value={card.dueDate ? card.dueDate.slice(0, 10) : ""}
            onChange={(e) => {
              const value = e.target.value;
              updateCard.mutate({ id: card.id, dueDate: value ? new Date(value).toISOString() : null });
            }}
            className="rounded-md border border-border bg-surface px-2 py-1 text-sm"
          />
        </div>

        <div>
          <div className="mb-1 text-xs font-medium uppercase text-gray-text">Labels</div>
          <div className="flex flex-wrap items-center gap-1.5">
            {card.labels.map((label) => (
              <LabelChip
                key={label.id}
                label={label}
                onRemove={() => detachLabel.mutate({ cardId: card.id, labelId: label.id })}
              />
            ))}
            <LabelPicker
              allLabels={allLabels}
              selectedLabels={card.labels}
              onToggle={(labelId, attached) => {
                if (attached) detachLabel.mutate({ cardId: card.id, labelId });
                else attachLabel.mutate({ cardId: card.id, labelId });
              }}
            />
          </div>
        </div>

        <button
          onClick={() => {
            deleteCard.mutate(card.id);
            onClose();
          }}
          className="mt-auto self-start text-sm text-red-600 hover:underline"
        >
          Delete card
        </button>
      </div>
    </>
  );
}
