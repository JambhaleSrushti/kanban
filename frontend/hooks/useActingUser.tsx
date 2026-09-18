"use client";

import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, setActingUserId } from "../lib/api";
import type { User } from "../lib/types";

type ActingUserContextValue = {
  actingUser: User | null;
  users: User[];
  setActingUser: (user: User) => void;
  isLoading: boolean;
};

const ActingUserContext = createContext<ActingUserContextValue | null>(null);
const STORAGE_KEY = "kanban.actingUserId";

export function ActingUserProvider({ children }: { children: ReactNode }) {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => api.get<User[]>("/users"),
  });
  const [manualUserId, setManualUserId] = useState<string | null>(null);

  const actingUserId = useMemo(() => {
    if (manualUserId && users.some((user) => user.id === manualUserId)) return manualUserId;
    if (users.length === 0) return null;
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      stored = null;
    }
    const match = users.find((user) => user.id === stored);
    return (match ?? users[0]).id;
  }, [manualUserId, users]);

  // Set synchronously during render (not in an effect) so the header is already
  // correct by the time descendant components' query effects fire — effects commit
  // bottom-up, so a child's fetch would otherwise race ahead of this parent's effect.
  setActingUserId(actingUserId);

  useEffect(() => {
    if (!actingUserId) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, actingUserId);
    } catch {
      // localStorage unavailable (private browsing); acting user still works for this session
    }
  }, [actingUserId]);

  const actingUser = users.find((user) => user.id === actingUserId) ?? null;

  return (
    <ActingUserContext.Provider
      value={{
        actingUser,
        users,
        setActingUser: (user) => setManualUserId(user.id),
        isLoading,
      }}
    >
      {children}
    </ActingUserContext.Provider>
  );
}

export function useActingUser() {
  const ctx = useContext(ActingUserContext);
  if (!ctx) throw new Error("useActingUser must be used within ActingUserProvider");
  return ctx;
}
