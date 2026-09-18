import { createApp } from "./app.js";
import { startDueDateChecker } from "./lib/dueDateChecker.js";

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
const app = createApp();

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
  startDueDateChecker();
});
