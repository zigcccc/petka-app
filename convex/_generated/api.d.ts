/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as crons from "../crons.js";
import type * as dictionary_models from "../dictionary/models.js";
import type * as dictionary_queries from "../dictionary/queries.js";
import type * as leaderboardEntries_model from "../leaderboardEntries/model.js";
import type * as leaderboards_models from "../leaderboards/models.js";
import type * as leaderboards_queries from "../leaderboards/queries.js";
import type * as migrations from "../migrations.js";
import type * as notifications_queries from "../notifications/queries.js";
import type * as notifications_services from "../notifications/services.js";
import type * as presence from "../presence.js";
import type * as puzzleGuessAttempts_helpers from "../puzzleGuessAttempts/helpers.js";
import type * as puzzleGuessAttempts_models from "../puzzleGuessAttempts/models.js";
import type * as puzzleGuessAttempts_queries from "../puzzleGuessAttempts/queries.js";
import type * as puzzles_internal from "../puzzles/internal.js";
import type * as puzzles_models from "../puzzles/models.js";
import type * as puzzles_queries from "../puzzles/queries.js";
import type * as shared_helpers from "../shared/helpers.js";
import type * as shared_models from "../shared/models.js";
import type * as shared_queries from "../shared/queries.js";
import type * as userPuzzleStatistics_internal from "../userPuzzleStatistics/internal.js";
import type * as userPuzzleStatistics_models from "../userPuzzleStatistics/models.js";
import type * as userPuzzleStatistics_queries from "../userPuzzleStatistics/queries.js";
import type * as users_models from "../users/models.js";
import type * as users_queries from "../users/queries.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  crons: typeof crons;
  "dictionary/models": typeof dictionary_models;
  "dictionary/queries": typeof dictionary_queries;
  "leaderboardEntries/model": typeof leaderboardEntries_model;
  "leaderboards/models": typeof leaderboards_models;
  "leaderboards/queries": typeof leaderboards_queries;
  migrations: typeof migrations;
  "notifications/queries": typeof notifications_queries;
  "notifications/services": typeof notifications_services;
  presence: typeof presence;
  "puzzleGuessAttempts/helpers": typeof puzzleGuessAttempts_helpers;
  "puzzleGuessAttempts/models": typeof puzzleGuessAttempts_models;
  "puzzleGuessAttempts/queries": typeof puzzleGuessAttempts_queries;
  "puzzles/internal": typeof puzzles_internal;
  "puzzles/models": typeof puzzles_models;
  "puzzles/queries": typeof puzzles_queries;
  "shared/helpers": typeof shared_helpers;
  "shared/models": typeof shared_models;
  "shared/queries": typeof shared_queries;
  "userPuzzleStatistics/internal": typeof userPuzzleStatistics_internal;
  "userPuzzleStatistics/models": typeof userPuzzleStatistics_models;
  "userPuzzleStatistics/queries": typeof userPuzzleStatistics_queries;
  "users/models": typeof users_models;
  "users/queries": typeof users_queries;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  migrations: import("@convex-dev/migrations/_generated/component.js").ComponentApi<"migrations">;
  crons: import("@convex-dev/crons/_generated/component.js").ComponentApi<"crons">;
  pushNotifications: import("@convex-dev/expo-push-notifications/_generated/component.js").ComponentApi<"pushNotifications">;
  presence: import("@convex-dev/presence/_generated/component.js").ComponentApi<"presence">;
};
