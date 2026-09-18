"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDeleteCard } from "../../hooks/useCards";
import { classifyDueDate } from "../../lib/dueStatus";
import type { Card as CardType } from "../../lib/types";
import { LabelChip } from "../labels/LabelChip";
import { Avatar } from "../users/Avatar";

const DUE_BADGE_CLASSES: Record<string, string> = {
  OVERDUE: "bg-red-100 text-red-700",
  DUE_SOON: "bg-accent-yellow text-dark-navy",
  UPCOMING: "bg-border/50 text-gray-text",
};

export function Card({
  card,
  dragDisabled,
  overlay,
  onOpen,
}: {
  card: CardType;
  dragDisabled?: boolean;
  overlay?: boolean;
  onOpen?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    disabled: dragDisabled,
  });
  const deleteCard = useDeleteCard();

  const style = overlay
    ? undefined
    : { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  const dueStatus = classifyDueDate(card.dueDate);

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={style}
      {...(overlay ? {} : attributes)}
      {...(overlay ? {} : listeners)}
      onClick={onOpen}
      className={`group flex cursor-pointer flex-col gap-1.5 rounded-md border border-border bg-background px-2.5 py-2 text-sm shadow-sm hover:border-blue-primary ${
        overlay ? "rotate-1 shadow-lg" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium text-foreground">{card.title}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteCard.mutate(card.id);
          }}
          className="text-gray-text opacity-0 hover:text-red-600 group-hover:opacity-100"
          aria-label="Delete card"
        >
          ×
        </button>
      </div>
      {card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {card.labels.map((label) => (
            <LabelChip key={label.id} label={label} />
          ))}
        </div>
      )}
      <div className="flex items-center justify-between">
        {dueStatus ? (
          <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${DUE_BADGE_CLASSES[dueStatus]}`}>
            {new Date(card.dueDate as string).toLocaleDateString()}
          </span>
        ) : (
          <span />
        )}
        {card.assignee && <Avatar name={card.assignee.name} size={20} />}
      </div>
    </div>
  );
}
