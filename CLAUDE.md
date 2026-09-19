# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A single-board Kanban app. Full requirements, tech stack, color scheme, and coding standards are defined in `AGENTS.md` — read it before making product/scope decisions. Key points not to violate: no login/auth (only a lightweight "acting as" user switcher), no archive feature, no notification types beyond `ASSIGNED`/`DUE_SOON`/`OVERDUE`, no feature creep beyond what `AGENTS.md` describes. Keep it simple — no unnecessary defensive programming, no emojis anywhere (including README/UI).

## Commands

Run from `backend/` and `frontend/` respectively (two separate npm projects, no root package.json).

**Backend** (`backend/`):
- `npm run dev` — start API on port 4000 (tsx watch)
- `npm run build` / `npm start` — compile and run production build
- `npm test` — run Vitest suite once; `npm run test:watch` for watch mode
- Single test file: `npx vitest run src/__tests__/cards.routes.test.ts`
- `npm run prisma:migrate` — create/apply a dev migration after editing `prisma/schema.prisma`
- `npm run prisma:seed` — reseed dummy data (`prisma/seed.ts`)
- `npm run prisma:studio` — open Prisma Studio against `dev.db`

**Frontend** (`frontend/`):
- `npm run dev` — start Next.js dev server on port 3000
- `npm run build` / `npm start` — production build and serve
- `npm run lint` — ESLint (flat config, `eslint-config-next`)
- Tests use Vitest + Testing Library + jsdom; no top-level `test` script exists in `package.json` — run via `npx vitest run` (single file: `npx vitest run lib/__tests__/filters.test.ts`)

Both servers must run simultaneously for the app to work end-to-end (frontend calls the backend over HTTP; there are no Next.js API routes).

## Architecture

**Two independent apps, REST between them.** `backend/` is an Express + TypeScript API; `frontend/` is a fully client-rendered Next.js App Router app. They share nothing but the HTTP contract at `NEXT_PUBLIC_API_URL` (default `http://localhost:4000/api`).

**Acting user is the only "auth."** Every frontend request (`frontend/lib/api.ts`) attaches `X-User-Id` from whatever user is currently selected in the switcher. The backend's `actingUser` middleware (`backend/src/middleware/actingUser.ts`) just reads that header into `req.actingUserId` — it does not gate access to anything, only scopes self-assignment notification skips (`notifyAssigned` won't notify you of your own assignment) and notification queries. Don't build real authorization around this header.

**Data model** (`backend/prisma/schema.prisma`): `Board` → `Column` → `Card`, plus `Label`/`CardLabel` (many-to-many), `User` (assignee, not an account), and `Notification`. There is exactly one `Board` seeded. Cards and columns each carry an integer `position` used for manual ordering — there is no separate ordering table.

**Reordering/move semantics.** `reorderIds()` (`backend/src/lib/reorder.ts`) is the single pure function for computing a new position list; it's used by every move/reorder route. Card moves (`POST /api/cards/:id/move`) recompute positions for the target column and, if the card changed columns, also renumber the source column — all writes go through one `prisma.$transaction`. When touching drag-and-drop or move endpoints, keep this "always renumber the full column, never leave gaps" pattern.

**Notifications are polling-based, not push.** `ASSIGNED` notifications fire inline whenever a card's `assigneeId` changes (in the cards routes). `DUE_SOON`/`OVERDUE` are produced by an in-process `setInterval` sweep (`backend/src/lib/dueDateChecker.ts`, started from `index.ts`, default every 5 minutes), which is idempotent per `(cardId, userId, type)` and skips cards in the last column. The frontend polls `useNotifications.ts` every 30s — there are no websockets/SSE anywhere in this codebase.

**Frontend data flow.** All server state goes through TanStack Query hooks in `frontend/hooks/` (`useBoard`, `useCards`, `useColumns`, `useLabels`, `useNotifications`, `useUsers`), which call the thin `frontend/lib/api.ts` wrapper. Drag-and-drop (`@dnd-kit`) in `components/board/` issues optimistic updates through these hooks. The card detail panel is driven by the `?card=<id>` URL query param (not local component state) so it's deep-linkable and the board stays visible behind it. While a search/filter (`components/search/SearchFilterBar.tsx`, `lib/filters.ts`) is active, drag-and-drop is disabled — reordering against a filtered subset would corrupt true positions.

**Testing setup.** Backend tests (Vitest + Supertest, `backend/src/__tests__/`) run against a real dedicated SQLite file (`prisma/test.db`), not mocks — `tests/globalSetup.ts` wipes it and runs `prisma migrate deploy` before the suite, and `vitest.config.ts` forces `fileParallelism: false` since tests share that one database file. Frontend unit tests (`frontend/lib/__tests__/`) use Vitest + jsdom + Testing Library, with MSW available for mocking the API layer.
