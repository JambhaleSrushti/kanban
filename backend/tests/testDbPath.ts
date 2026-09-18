import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
export const testDbFile = path.resolve(dir, "../prisma/test.db");
export const testDbUrl = `file:${testDbFile}`;
