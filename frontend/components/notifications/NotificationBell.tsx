"use client";

import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "../../hooks/useNotifications";
import type { Notification } from "../../lib/types";
import { NotificationPanel } from "./NotificationPanel";

export function NotificationBell({ onOpenCard }: { onOpenCard: (cardId: string) => void }) {
  const { data: notifications = [] } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSelect = (notification: Notification) => {
    if (!notification.read) markRead.mutate(notification.id);
    if (notification.cardId) onOpenCard(notification.cardId);
    setOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          className="relative rounded-md border border-border bg-surface p-1.5 hover:bg-border/40"
          aria-label="Notifications"
        >
          <BellIcon />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-yellow px-1 text-[10px] font-bold text-dark-navy">
              {unreadCount}
            </span>
          )}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={6}
          className="z-50 rounded-md border border-border bg-surface shadow-lg"
        >
          <NotificationPanel
            notifications={notifications}
            onSelect={handleSelect}
            onMarkAllRead={() => markAllRead.mutate()}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function BellIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
