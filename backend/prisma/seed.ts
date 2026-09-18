import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const hoursFromNow = (hours: number) => new Date(Date.now() + hours * 60 * 60 * 1000);

async function main() {
  await prisma.notification.deleteMany();
  await prisma.cardLabel.deleteMany();
  await prisma.card.deleteMany();
  await prisma.column.deleteMany();
  await prisma.board.deleteMany();
  await prisma.label.deleteMany();
  await prisma.user.deleteMany();

  const [ash, sam, jordan, priya] = await Promise.all([
    prisma.user.create({ data: { name: "Ash" } }),
    prisma.user.create({ data: { name: "Sam" } }),
    prisma.user.create({ data: { name: "Jordan" } }),
    prisma.user.create({ data: { name: "Priya" } }),
  ]);

  const labelDefs = [
    { name: "Bug", color: "#e5484d" },
    { name: "Feature", color: "#209dd7" },
    { name: "Urgent", color: "#ecad0a" },
    { name: "Design", color: "#753991" },
    { name: "Backend", color: "#032147" },
    { name: "Docs", color: "#888888" },
    { name: "Research", color: "#0e9f6e" },
    { name: "Blocked", color: "#b91c1c" },
  ];
  const labels = await Promise.all(labelDefs.map((l) => prisma.label.create({ data: l })));
  const labelByName = Object.fromEntries(labels.map((l) => [l.name, l]));

  const board = await prisma.board.create({ data: { name: "Product Board" } });

  const columnNames = ["Backlog", "To Do", "In Progress", "In Review", "Done"];
  const columns = await Promise.all(
    columnNames.map((name, position) => prisma.column.create({ data: { boardId: board.id, name, position } })),
  );
  const [backlog, todo, inProgress, inReview, done] = columns;

  type SeedCard = {
    columnId: string;
    title: string;
    details: string;
    dueDate?: Date | null;
    assigneeId?: string | null;
    labels?: string[];
  };

  const cards: SeedCard[] = [
    {
      columnId: backlog.id,
      title: "Research competitor pricing",
      details: "Survey five comparable products and summarize pricing tiers.",
      labels: ["Research"],
    },
    {
      columnId: backlog.id,
      title: "Explore dark mode palette",
      details: "Draft a dark-mode variant of the existing color scheme.",
      assigneeId: priya.id,
      labels: ["Design"],
    },
    {
      columnId: todo.id,
      title: "Fix card drag ghost flicker",
      details: "The drag preview flickers on fast pointer moves in Safari.",
      dueDate: hoursFromNow(20),
      assigneeId: sam.id,
      labels: ["Bug", "Urgent"],
    },
    {
      columnId: todo.id,
      title: "Write onboarding docs",
      details: "Document how to add a new label and assign teammates.",
      assigneeId: jordan.id,
      labels: ["Docs"],
    },
    {
      columnId: inProgress.id,
      title: "Notification polling endpoint",
      details: "Add GET /api/notifications with unread filtering.",
      dueDate: hoursFromNow(-5),
      assigneeId: ash.id,
      labels: ["Backend", "Feature"],
    },
    {
      columnId: inProgress.id,
      title: "Label manager UI",
      details: "Build the popover for creating and editing labels.",
      dueDate: hoursFromNow(72),
      assigneeId: priya.id,
      labels: ["Design", "Feature"],
    },
    {
      columnId: inReview.id,
      title: "Card detail panel keyboard nav",
      details: "Esc closes the panel, focus returns to the triggering card.",
      assigneeId: jordan.id,
      labels: ["Feature"],
    },
    {
      columnId: inReview.id,
      title: "Third-party auth vendor blocked",
      details: "Waiting on legal sign-off before integrating the vendor SDK.",
      assigneeId: sam.id,
      labels: ["Blocked"],
    },
    {
      columnId: done.id,
      title: "Set up CI pipeline",
      details: "Run backend and frontend test suites on every push.",
      assigneeId: ash.id,
      labels: ["Backend"],
    },
    {
      columnId: done.id,
      title: "Initial board scaffolding",
      details: "Columns, cards, and the base layout are in place.",
      assigneeId: jordan.id,
    },
  ];

  for (const [index, group] of Object.entries(
    cards.reduce<Record<string, SeedCard[]>>((acc, card) => {
      (acc[card.columnId] ??= []).push(card);
      return acc;
    }, {}),
  )) {
    void index;
    for (const [position, card] of group.entries()) {
      const created = await prisma.card.create({
        data: {
          columnId: card.columnId,
          title: card.title,
          details: card.details,
          position,
          dueDate: card.dueDate ?? null,
          assigneeId: card.assigneeId ?? null,
        },
      });
      for (const labelName of card.labels ?? []) {
        await prisma.cardLabel.create({ data: { cardId: created.id, labelId: labelByName[labelName].id } });
      }
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
