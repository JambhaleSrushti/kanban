import { prisma } from "../lib/prisma.js";

export async function resetDb() {
  await prisma.notification.deleteMany();
  await prisma.cardLabel.deleteMany();
  await prisma.card.deleteMany();
  await prisma.column.deleteMany();
  await prisma.board.deleteMany();
  await prisma.label.deleteMany();
  await prisma.user.deleteMany();
}

export async function seedBoard() {
  const board = await prisma.board.create({ data: { name: "Test Board" } });
  const columnNames = ["Backlog", "To Do", "In Progress", "In Review", "Done"];
  const columns = await Promise.all(
    columnNames.map((name, position) => prisma.column.create({ data: { boardId: board.id, name, position } })),
  );
  return { board, columns };
}
