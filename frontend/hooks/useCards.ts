"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Board, Card } from "../lib/types";

type CreateCardInput = {
  columnId: string;
  title: string;
  details?: string;
  dueDate?: string | null;
  assigneeId?: string | null;
};

type UpdateCardInput = {
  id: string;
  title?: string;
  details?: string;
  dueDate?: string | null;
  assigneeId?: string | null;
};

type MoveCardInput = { id: string; columnId: string; position: number };

export function useCreateCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCardInput) => api.post<Card>("/cards", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["board"] }),
  });
}

export function useUpdateCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateCardInput) => api.patch<Card>(`/cards/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["board"] }),
  });
}

export function useDeleteCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/cards/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["board"] }),
  });
}

function applyOptimisticMove(board: Board, cardId: string, targetColumnId: string, position: number): Board {
  let moving: Card | undefined;
  const columnsWithoutCard = board.columns.map((column) => {
    const found = column.cards.find((card) => card.id === cardId);
    if (found) moving = found;
    return { ...column, cards: column.cards.filter((card) => card.id !== cardId) };
  });
  if (!moving) return board;

  const updated: Card = { ...moving, columnId: targetColumnId };

  return {
    ...board,
    columns: columnsWithoutCard.map((column) => {
      if (column.id !== targetColumnId) return column;
      const cards = [...column.cards];
      const index = Math.max(0, Math.min(position, cards.length));
      cards.splice(index, 0, updated);
      return { ...column, cards };
    }),
  };
}

export function useMoveCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, columnId, position }: MoveCardInput) =>
      api.post<Card>(`/cards/${id}/move`, { columnId, position }),
    onMutate: async ({ id, columnId, position }) => {
      await queryClient.cancelQueries({ queryKey: ["board"] });
      const previous = queryClient.getQueryData<Board>(["board"]);
      if (previous) {
        queryClient.setQueryData<Board>(["board"], applyOptimisticMove(previous, id, columnId, position));
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(["board"], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["board"] }),
  });
}

export function useAttachLabel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, labelId }: { cardId: string; labelId: string }) =>
      api.post<Card>(`/cards/${cardId}/labels`, { labelId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["board"] }),
  });
}

export function useDetachLabel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, labelId }: { cardId: string; labelId: string }) =>
      api.delete<Card>(`/cards/${cardId}/labels/${labelId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["board"] }),
  });
}
