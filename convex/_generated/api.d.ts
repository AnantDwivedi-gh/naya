/* eslint-disable */
/**
 * Generated API type stubs.
 *
 * These are placeholder types that will be replaced when you run
 * `npx convex dev` or `npx convex deploy`. They enable TypeScript
 * to resolve imports before a Convex backend is configured.
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

import type * as features from "../features";
import type * as communities from "../communities";
import type * as polls from "../polls";
import type * as users from "../users";
import type * as seed from "../seed";
import type * as deviceCapabilities from "../deviceCapabilities";

declare const fullApi: ApiFromModules<{
  features: typeof features;
  communities: typeof communities;
  polls: typeof polls;
  users: typeof users;
  seed: typeof seed;
  deviceCapabilities: typeof deviceCapabilities;
}>;

export declare const api: FilterApi<typeof fullApi, FunctionReference<any, "public">>;
export declare const internal: FilterApi<typeof fullApi, FunctionReference<any, "internal">>;
