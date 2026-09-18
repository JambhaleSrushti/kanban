"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Board } from "../lib/types";

export function useBoard() {
  return useQuery({ queryKey: ["board"], queryFn: () => api.get<Board>("/board") });
}
