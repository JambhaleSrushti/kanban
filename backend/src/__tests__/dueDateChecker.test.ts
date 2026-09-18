import { beforeEach, describe, expect, it } from "vitest";
import { checkDueDates } from "../lib/dueDateChecker.js";
import { prisma } from "../lib/prisma.js";
import { resetDb, seedBoard } from "./testHelpers.js";

describe("checkDueDates", () => {
  let columns: Awaited<ReturnType<typeof seedBoard>>["columns"];

  beforeEach(async () => {
    await resetDb();
    ({ columns } = await seedBoard());
  });

  it("creates an OVERDUE notification for a past-due assigned card", async () => {
    const user = await prisma.user.create({ data: { name: "Sam" } });
    await prisma.card.create({
      data: {
        columnId: columns[0].id,
        title: "Late",
        details: "",
        position: 0,
        dueDate: new Date(Date.now() - 60 * 60 * 1000),
        assigneeId: user.id,
      },
    });

    await checkDueDates();

    const notifications = await prisma.notification.findMany({ where: { userId: user.id } });
    expect(notifications).toHaveLength(1);
    expect(notifications[0].type).toBe("OVERDUE");
  });

  it("does not duplicate a notification on repeated checks", async () => {
    const user = await prisma.user.create({ data: { name: "Sam" } });
    await prisma.card.create({
      data: {
        columnId: columns[0].id,
        title: "Late",
        details: "",
        position: 0,
        dueDate: new Date(Date.now() - 60 * 60 * 1000),
        assigneeId: user.id,
      },
    });

    await checkDueDates();
    await checkDueDates();

    const notifications = await prisma.notification.findMany({ where: { userId: user.id } });
    expect(notifications).toHaveLength(1);
  });

  it("skips cards in the last column", async () => {
    const user = await prisma.user.create({ data: { name: "Sam" } });
    const lastColumn = columns[columns.length - 1];
    await prisma.card.create({
      data: {
        columnId: lastColumn.id,
        title: "Done but late",
        details: "",
        position: 0,
        dueDate: new Date(Date.now() - 60 * 60 * 1000),
        assigneeId: user.id,
      },
    });

    await checkDueDates();

    const notifications = await prisma.notification.findMany({ where: { userId: user.id } });
    expect(notifications).toHaveLength(0);
  });
});
