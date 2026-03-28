/* eslint-disable */
/**
 * Generated server type stubs.
 * Run `npx convex dev` to regenerate.
 */
import {
  GenericQueryCtx,
  GenericMutationCtx,
  GenericActionCtx,
  GenericDatabaseReader,
  GenericDatabaseWriter,
} from "convex/server";
import { DataModel } from "./dataModel";

export type QueryCtx = GenericQueryCtx<DataModel>;
export type MutationCtx = GenericMutationCtx<DataModel>;
export type ActionCtx = GenericActionCtx<DataModel>;
export type DatabaseReader = GenericDatabaseReader<DataModel>;
export type DatabaseWriter = GenericDatabaseWriter<DataModel>;

export {
  query,
  internalQuery,
  mutation,
  internalMutation,
  action,
  internalAction,
  httpAction,
} from "convex/server";
