import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByUserBrowserOs = query({
  args: {
    userId: v.string(),
    browser: v.string(),
    os: v.string(),
  },
  handler: async (ctx, args) => {
    const devices = await ctx.db
      .query("deviceCapabilities")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    return (
      devices.find(
        (d) => d.browser === args.browser && d.os === args.os
      ) ?? null
    );
  },
});

export const get = query({
  args: { deviceId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("deviceCapabilities")
      .withIndex("by_deviceId", (q) => q.eq("deviceId", args.deviceId))
      .unique();
  },
});

export const register = mutation({
  args: {
    deviceId: v.string(),
    userId: v.string(),
    browser: v.string(),
    os: v.string(),
    screenWidth: v.number(),
    screenHeight: v.number(),
    supportedApis: v.array(v.string()),
    extensionsInstalled: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("deviceCapabilities", {
      ...args,
      registeredAt: new Date().toISOString(),
    });
    return await ctx.db.get(id);
  },
});

export const update = mutation({
  args: {
    deviceId: v.string(),
    screenWidth: v.optional(v.number()),
    screenHeight: v.optional(v.number()),
    supportedApis: v.optional(v.array(v.string())),
    extensionsInstalled: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("deviceCapabilities")
      .withIndex("by_deviceId", (q) => q.eq("deviceId", args.deviceId))
      .unique();
    if (!existing) return null;

    const updates: Record<string, unknown> = {
      registeredAt: new Date().toISOString(),
    };
    if (args.screenWidth !== undefined) updates.screenWidth = args.screenWidth;
    if (args.screenHeight !== undefined) updates.screenHeight = args.screenHeight;
    if (args.supportedApis !== undefined) updates.supportedApis = args.supportedApis;
    if (args.extensionsInstalled !== undefined) updates.extensionsInstalled = args.extensionsInstalled;

    await ctx.db.patch(existing._id, updates);
    return await ctx.db.get(existing._id);
  },
});
