"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback } from "react";
import { Board } from "../components/board/Board";
import { LabelManager } from "../components/labels/LabelManager";
import { NotificationBell } from "../components/notifications/NotificationBell";
import { UserSwitcher } from "../components/users/UserSwitcher";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const openCardId = searchParams.get("card");

  const onOpenCard = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("card", id);
      router.push(`/?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const onCloseCard = useCallback(() => {
    router.push("/", { scroll: false });
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
        <h1 className="text-lg font-semibold text-foreground">Product Board</h1>
        <div className="flex items-center gap-2">
          <LabelManager />
          <NotificationBell onOpenCard={onOpenCard} />
          <UserSwitcher />
        </div>
      </header>
      <Board openCardId={openCardId} onOpenCard={onOpenCard} onCloseCard={onCloseCard} />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-gray-text">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
