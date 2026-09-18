import { defineConfig } from "vitest/config";
import { testDbUrl } from "./tests/testDbPath.js";

export default defineConfig({
  test: {
    environment: "node",
    globalSetup: ["./tests/globalSetup.ts"],
    env: { DATABASE_URL: testDbUrl },
    fileParallelism: false,
  },
});
