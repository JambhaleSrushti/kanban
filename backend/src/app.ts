import cors from "cors";
import express from "express";
import { actingUser } from "./middleware/actingUser.js";
import boardRouter from "./routes/board.js";
import cardsRouter from "./routes/cards.js";
import columnsRouter from "./routes/columns.js";
import labelsRouter from "./routes/labels.js";
import notificationsRouter from "./routes/notifications.js";
import usersRouter from "./routes/users.js";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(actingUser);

  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/api/board", boardRouter);
  app.use("/api/columns", columnsRouter);
  app.use("/api/cards", cardsRouter);
  app.use("/api/labels", labelsRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/notifications", notificationsRouter);

  return app;
}
