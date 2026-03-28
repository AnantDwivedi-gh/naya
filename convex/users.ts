import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export const get = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    if (!user) return null;

    // Fetch authored features
    const features = await ctx.db
      .query("features")
      .withIndex("by_authorId", (q) => q.eq("authorId", args.userId))
      .collect();

    return {
      ...user,
      features,
      stats: {
        totalFeatures: features.length,
        totalDeploys: features.reduce((sum, f) => sum + f.deployCount, 0),
        totalUpvotes: features.reduce((sum, f) => sum + f.upvotes, 0),
        totalForks: features.reduce((sum, f) => sum + f.forkCount, 0),
      },
    };
  },
});

export const getByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
  },
});

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export const create = mutation({
  args: {
    userId: v.string(),
    username: v.string(),
    displayName: v.string(),
    avatarUrl: v.string(),
    bio: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("users", {
      ...args,
      featureIds: [],
      communityIds: [],
      deployedFeatureIds: [],
      reputation: 0,
      createdAt: new Date().toISOString(),
    });
    return await ctx.db.get(id);
  },
});

export const addFeature = mutation({
  args: { userId: v.string(), featureId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    if (!user) return false;
    if (!user.featureIds.includes(args.featureId)) {
      await ctx.db.patch(user._id, {
        featureIds: [...user.featureIds, args.featureId],
      });
    }
    return true;
  },
});

export const addDeployedFeature = mutation({
  args: { userId: v.string(), featureId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    if (!user) return false;
    if (!user.deployedFeatureIds.includes(args.featureId)) {
      await ctx.db.patch(user._id, {
        deployedFeatureIds: [...user.deployedFeatureIds, args.featureId],
      });
    }
    return true;
  },
});

export const removeDeployedFeature = mutation({
  args: { userId: v.string(), featureId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    if (!user) return false;
    await ctx.db.patch(user._id, {
      deployedFeatureIds: user.deployedFeatureIds.filter(
        (id) => id !== args.featureId
      ),
    });
    return true;
  },
});
