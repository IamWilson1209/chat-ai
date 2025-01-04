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
import type * as clerkAction from "../clerkAction.js";
import type * as functions_conversations from "../functions/conversations.js";
import type * as functions_messages from "../functions/messages.js";
import type * as functions_users from "../functions/users.js";
import type * as http from "../http.js";
import type * as openai from "../openai.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  clerkAction: typeof clerkAction;
  "functions/conversations": typeof functions_conversations;
  "functions/messages": typeof functions_messages;
  "functions/users": typeof functions_users;
  http: typeof http;
  openai: typeof openai;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
