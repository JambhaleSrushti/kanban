import { execSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { testDbFile, testDbUrl } from "./testDbPath.js";

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export default async function setup() {
  if (existsSync(testDbFile)) rmSync(testDbFile);

  execSync("npx prisma migrate deploy", {
    cwd: backendRoot,
    env: { ...process.env, DATABASE_URL: testDbUrl },
    stdio: "inherit",
  });

  return async () => {
    if (existsSync(testDbFile)) rmSync(testDbFile);
  };
}
