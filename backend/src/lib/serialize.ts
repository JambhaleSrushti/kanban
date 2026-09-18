import type { Card, CardLabel, Label, User } from "@prisma/client";

type CardWithRelations = Card & {
  labels: (CardLabel & { label: Label })[];
  assignee: User | null;
};

/** Flattens the CardLabel join rows into a plain Label[] for API responses. */
export function serializeCard(card: CardWithRelations) {
  const { labels, ...rest } = card;
  return { ...rest, labels: labels.map((cardLabel) => cardLabel.label) };
}

export const cardInclude = {
  labels: { include: { label: true } },
  assignee: true,
} as const;
