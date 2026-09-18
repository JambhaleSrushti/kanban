"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Column } from "../lib/types";

export function useRenameColumn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => api.patch<Column>(`/columns/${id}`, { name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["board"] }),
  });
}
