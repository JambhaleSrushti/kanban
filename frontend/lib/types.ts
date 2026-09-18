export type User = {
  id: string;
  name: string;
  createdAt: string;
};

export type Label = {
  id: string;
  name: string;
  color: string;
  createdAt: string;
};

export type Card = {
  id: string;
  columnId: string;
  title: string;
  details: string;
  position: number;
  dueDate: string | null;
  assigneeId: string | null;
  assignee: User | null;
  labels: Label[];
  createdAt: string;
  updatedAt: string;
};

export type Column = {
  id: string;
  boardId: string;
  name: string;
  position: number;
  createdAt: string;
  cards: Card[];
};

export type Board = {
  id: string;
  name: string;
  createdAt: string;
  columns: Column[];
};

export type NotificationType = "ASSIGNED" | "DUE_SOON" | "OVERDUE";

export type Notification = {
  id: string;
  userId: string;
  type: NotificationType;
  cardId: string | null;
  message: string;
  read: boolean;
  createdAt: string;
};
