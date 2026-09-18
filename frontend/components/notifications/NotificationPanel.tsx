"use client";

import type { Notification } from "../../lib/types";

const TYPE_LABEL: Record<Notification["type"], string> = {
  ASSIGNED: "Assigned",
  DUE_SOON: "Due soon",
  OVERDUE: "Overdue",
};

export function NotificationPanel({
  notifications,
  onSelect,
  onMarkAllRead,
}: {
  notifications: Notification[];
  onSelect: (notification: Notification) => void;
  onMarkAllRead: () => void;
}) {
  return (
    <div className="flex max-h-96 w-80 flex-col">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-sm font-semibold">Notifications</span>
        <button onClick={onMarkAllRead} className="text-xs text-blue-primary hover:underline">
          Mark all read
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 && (
          <div className="px-3 py-6 text-center text-sm text-gray-text">You&apos;re all caught up</div>
        )}
        {notifications.map((notification) => (
          <button
            key={notification.id}
            onClick={() => onSelect(notification)}
            className={`flex w-full flex-col gap-0.5 border-b border-border px-3 py-2 text-left text-sm hover:bg-border/30 ${
              notification.read ? "opacity-60" : ""
            }`}
          >
            <span className="text-xs font-medium uppercase text-gray-text">{TYPE_LABEL[notification.type]}</span>
            <span>{notification.message}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
