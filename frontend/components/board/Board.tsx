"use client";

import {
  closestCorners,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useMemo, useState } from "react";
import { useBoard } from "../../hooks/useBoard";
import { useMoveCard } from "../../hooks/useCards";
import { cardMatchesFilters, defaultFilters, isFiltersActive, type BoardFilters } from "../../lib/filters";
import type { Card as CardType } from "../../lib/types";
import { SearchFilterBar } from "../search/SearchFilterBar";
import { Card } from "./Card";
import { CardDetailPanel } from "./CardDetailPanel";
import { Column } from "./Column";

export function Board({
  openCardId,
  onOpenCard,
  onCloseCard,
}: {
  openCardId: string | null;
  onOpenCard: (id: string) => void;
  onCloseCard: () => void;
}) {
  const { data: board, isLoading } = useBoard();
  const moveCard = useMoveCard();
  const [filters, setFilters] = useState<BoardFilters>(defaultFilters);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const filtersActive = isFiltersActive(filters);

  const cardsById = useMemo(() => {
    const map = new Map<string, CardType>();
    board?.columns.forEach((column) => column.cards.forEach((card) => map.set(card.id, card)));
    return map;
  }, [board]);

  if (isLoading || !board) {
    return <div className="p-8 text-sm text-gray-text">Loading board...</div>;
  }

  function handleDragStart(event: DragStartEvent) {
    const card = cardsById.get(String(event.active.id));
    setActiveCard(card ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null);
    const { active, over } = event;
    if (!over || !board) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const targetColumn =
      board.columns.find((column) => column.id === overId) ??
      board.columns.find((column) => column.cards.some((card) => card.id === overId));
    if (!targetColumn) return;

    const index = targetColumn.cards.findIndex((card) => card.id === overId);
    const position = index === -1 ? targetColumn.cards.length : index;

    moveCard.mutate({ id: activeId, columnId: targetColumn.id, position });
  }

  const boardColumns = board.columns.map((column) => ({
    column,
    cards: column.cards.filter((card) => !filtersActive || cardMatchesFilters(card, filters)),
  }));

  const openCard = openCardId ? cardsById.get(openCardId) ?? null : null;

  const columnsContent = (
    <div className="flex flex-1 gap-4 overflow-x-auto p-4">
      {boardColumns.map(({ column, cards }) => (
        <Column key={column.id} column={column} cards={cards} dragDisabled={filtersActive} onOpenCard={onOpenCard} />
      ))}
    </div>
  );

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-border px-4 py-3">
        <SearchFilterBar filters={filters} onChange={setFilters} />
        {filtersActive && <p className="mt-1 text-xs text-gray-text">Clear filters to reorder cards by drag and drop.</p>}
      </div>

      {filtersActive ? (
        columnsContent
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {columnsContent}
          <DragOverlay>{activeCard && <Card card={activeCard} overlay />}</DragOverlay>
        </DndContext>
      )}

      {openCard && <CardDetailPanel key={openCard.id} card={openCard} onClose={onCloseCard} />}
    </div>
  );
}
