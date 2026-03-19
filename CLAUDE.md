# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

Petka is a Slovenian-language Wordle clone built with React Native / Expo. The backend runs on Convex (real-time database + serverless functions). UI is themed via react-native-unistyles (light/dark). All text in the app is in Slovenian.

## Commands

```bash
pnpm install            # Install dependencies
pnpm start              # Start Expo dev server
pnpm run lint           # Biome check
pnpm run typecheck      # tsc --noEmit
pnpm run format         # Biome format --write .
pnpm test               # Jest
pnpm test:coverage      # Jest with coverage
pnpm test path/to/test.ts   # Single test file
```

For Convex backend development, run `pnpx convex dev` alongside the Expo dev server.

## Environment variables

- `EXPO_PUBLIC_CONVEX_URL` — Convex deployment URL (required for the app to start)
- `EXPO_PUBLIC_POSTHOG_API_KEY` — PostHog analytics key (not required for dev envs)
- `APP_ENV=production` — must be set for production builds (controls app name, bundle ID, icon, Sentry)
- `GOOGLE_SERVICES_JSON` — path to Firebase config (production Android only)

## Architecture

### Frontend (`src/`)

**Routing** uses Expo Router (file-based). Entry is `src/app/_layout.tsx`, which mounts all global providers (Convex, PostHog, Sentry, GestureHandler, BottomSheet, ActionSheet, Prompt) and handles fonts, image preloading, theme initialization, and push notification registration.

- `src/app/(authenticated)/` — main app screens, protected by `_layout.tsx` which redirects to `/onboard/create-account` if no user exists
- `src/app/onboard/` — account creation flow

**User identity** is not traditional auth. A Convex user ID is stored in AsyncStorage on first account creation. `useUser()` (`src/hooks/useUser/`) is the central hook for all user state — it loads the ID from storage, fetches the Convex user record, and exposes create/update/delete handlers.

**Data fetching** all goes through two factory functions:

- `generateUseQueryHook(queryFn)` — wraps a Convex query, returns `{ isLoading, isNotFound, data }`
- `generateUseMutationHook(mutationFn)` — wraps a Convex mutation, returns `{ isLoading, mutate }`, auto-captures errors to PostHog

Every hook in `src/hooks/queries/` and `src/hooks/mutations/` is produced by these factories.

**Styling** uses `react-native-unistyles`. Always import `StyleSheet` from `react-native-unistyles`, not `react-native`, to get theme access. Themes are in `src/styles/themes.ts`. Theme preference is persisted in MMKV (`storage` from `@/utils/storage`).

### Backend (`convex/`)

Each resource (users, puzzles, leaderboards, etc.) has its own folder with:

- `models.ts` — Zod schema + `zodToConvex` table definition
- `queries.ts` — Convex query functions
- `mutations.ts` — Convex mutation functions

`convex/schema.ts` assembles all table definitions and their indexes. `convex/convex.config.ts` registers Convex components (crons, migrations, expo-push-notifications, presence). Never edit `convex/_generated/`.

Validators use `zod` (v4) via `convex-helpers/server/zod4` (`zodToConvex`, `zid` for typed document IDs).

## Code conventions

**Imports:** ordered `object → builtin → external → internal → parent → sibling → index`, with a blank line between groups. Internal paths use the `@/` alias (maps to `src/`). Type-only imports must use `import type { X }` syntax (also enforced by biome). For mixed imports use `import { Component, type ComponentProps }` syntax.

**JSX props:** all props sorted alphabetically (enforced by Biome `useSortedAttributes`).

**Unused vars:** prefix with `_` to suppress the lint rule (`_unusedVar`). Avoid doing that unless absolutely necessary.

**Biome:** 120-char line width, single quotes, 2-space indent, trailing commas (ES5). Config in `biome.json`.

**Convex mutations:** always use `generateUseMutationHook` — it provides consistent loading state and PostHog error capture. Do not call `useMutation` directly in components.

**Convex queries:** always use `generateUseQueryHook` unless query requires a timestamp — it provides consistent loading state. Do not call `useQuery` directly in components.

**Daily puzzle timing:** `generateUseQueryHookWithTimestampArg` passes a stable UTC midnight timestamp so the daily puzzle query doesn't re-fire during a session when the date rolls over. Use anytime a query requires a timestamp.
