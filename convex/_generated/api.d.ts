/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as dictionary_models from "../dictionary/models.js";
import type * as dictionary_queries from "../dictionary/queries.js";
import type * as shared_models from "../shared/models.js";
import type * as shared_queries from "../shared/queries.js";
import type * as users_models from "../users/models.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "dictionary/models": typeof dictionary_models;
  "dictionary/queries": typeof dictionary_queries;
  "shared/models": typeof shared_models;
  "shared/queries": typeof shared_queries;
  "users/models": typeof users_models;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
