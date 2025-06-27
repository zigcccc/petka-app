/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as crons from '../crons.js';
import type * as dictionary_models from '../dictionary/models.js';
import type * as dictionary_queries from '../dictionary/queries.js';
import type * as migrations from '../migrations.js';
import type * as puzzleGuessAttempts_helpers from '../puzzleGuessAttempts/helpers.js';
import type * as puzzleGuessAttempts_models from '../puzzleGuessAttempts/models.js';
import type * as puzzleGuessAttempts_queries from '../puzzleGuessAttempts/queries.js';
import type * as puzzles_internal from '../puzzles/internal.js';
import type * as puzzles_models from '../puzzles/models.js';
import type * as puzzles_queries from '../puzzles/queries.js';
import type * as shared_models from '../shared/models.js';
import type * as shared_queries from '../shared/queries.js';
import type * as users_models from '../users/models.js';
import type * as users_queries from '../users/queries.js';

import type { ApiFromModules, FilterApi, FunctionReference } from 'convex/server';

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  crons: typeof crons;
  'dictionary/models': typeof dictionary_models;
  'dictionary/queries': typeof dictionary_queries;
  migrations: typeof migrations;
  'puzzleGuessAttempts/helpers': typeof puzzleGuessAttempts_helpers;
  'puzzleGuessAttempts/models': typeof puzzleGuessAttempts_models;
  'puzzleGuessAttempts/queries': typeof puzzleGuessAttempts_queries;
  'puzzles/internal': typeof puzzles_internal;
  'puzzles/models': typeof puzzles_models;
  'puzzles/queries': typeof puzzles_queries;
  'shared/models': typeof shared_models;
  'shared/queries': typeof shared_queries;
  'users/models': typeof users_models;
  'users/queries': typeof users_queries;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<typeof fullApiWithMounts, FunctionReference<any, 'public'>>;
export declare const internal: FilterApi<typeof fullApiWithMounts, FunctionReference<any, 'internal'>>;

export declare const components: {
  migrations: {
    lib: {
      cancel: FunctionReference<
        'mutation',
        'internal',
        { name: string },
        {
          batchSize?: number;
          cursor?: string | null;
          error?: string;
          isDone: boolean;
          latestEnd?: number;
          latestStart: number;
          name: string;
          next?: Array<string>;
          processed: number;
          state: 'inProgress' | 'success' | 'failed' | 'canceled' | 'unknown';
        }
      >;
      cancelAll: FunctionReference<
        'mutation',
        'internal',
        { sinceTs?: number },
        Array<{
          batchSize?: number;
          cursor?: string | null;
          error?: string;
          isDone: boolean;
          latestEnd?: number;
          latestStart: number;
          name: string;
          next?: Array<string>;
          processed: number;
          state: 'inProgress' | 'success' | 'failed' | 'canceled' | 'unknown';
        }>
      >;
      clearAll: FunctionReference<'mutation', 'internal', { before?: number }, null>;
      getStatus: FunctionReference<
        'query',
        'internal',
        { limit?: number; names?: Array<string> },
        Array<{
          batchSize?: number;
          cursor?: string | null;
          error?: string;
          isDone: boolean;
          latestEnd?: number;
          latestStart: number;
          name: string;
          next?: Array<string>;
          processed: number;
          state: 'inProgress' | 'success' | 'failed' | 'canceled' | 'unknown';
        }>
      >;
      migrate: FunctionReference<
        'mutation',
        'internal',
        {
          batchSize?: number;
          cursor?: string | null;
          dryRun: boolean;
          fnHandle: string;
          name: string;
          next?: Array<{ fnHandle: string; name: string }>;
        },
        {
          batchSize?: number;
          cursor?: string | null;
          error?: string;
          isDone: boolean;
          latestEnd?: number;
          latestStart: number;
          name: string;
          next?: Array<string>;
          processed: number;
          state: 'inProgress' | 'success' | 'failed' | 'canceled' | 'unknown';
        }
      >;
    };
  };
  crons: {
    public: {
      del: FunctionReference<'mutation', 'internal', { identifier: { id: string } | { name: string } }, null>;
      get: FunctionReference<
        'query',
        'internal',
        { identifier: { id: string } | { name: string } },
        {
          args: Record<string, any>;
          functionHandle: string;
          id: string;
          name?: string;
          schedule: { kind: 'interval'; ms: number } | { cronspec: string; kind: 'cron'; tz?: string };
        } | null
      >;
      list: FunctionReference<
        'query',
        'internal',
        {},
        Array<{
          args: Record<string, any>;
          functionHandle: string;
          id: string;
          name?: string;
          schedule: { kind: 'interval'; ms: number } | { cronspec: string; kind: 'cron'; tz?: string };
        }>
      >;
      register: FunctionReference<
        'mutation',
        'internal',
        {
          args: Record<string, any>;
          functionHandle: string;
          name?: string;
          schedule: { kind: 'interval'; ms: number } | { cronspec: string; kind: 'cron'; tz?: string };
        },
        string
      >;
    };
  };
};
