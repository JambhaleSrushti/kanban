"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { User } from "../lib/types";

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => api.post<User>("/users", { name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}
