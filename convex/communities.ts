import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export const list = query({
  args: {
    search: v.optional(v.string()),
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let results = await ctx.db.query("communities").collect();

    if (args.search) {
      const q = args.search.toLowerCase();
      results = results.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.tags.some((t) => t.includes(q))
      );
    }

    results.sort((a, b) => b.memberCount - a.memberCount);

    const page = args.page ?? 1;
    const pageSize = args.pageSize ?? 20;
    const total = results.length;
    const start = (page - 1) * pageSize;
    const paged = results.slice(start, start + pageSize);

    return {
      success: true,
      data: paged,
      meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    };
  },
});

export const get = query({
  args: { communityId: v.string() },
  handler: async (ctx, args) => {
    const community = await ctx.db
      .query("communities")
      .withIndex("by_communityId", (q) =>
        q.eq("communityId", args.communityId)
      )
      .unique();
    if (!community) return null;

    // Resolve features
    const features = [];
    for (const fid of community.featureIds) {
      const feature = await ctx.db
        .query("features")
        .withIndex("by_featureId", (q) => q.eq("featureId", fid))
        .unique();
      if (feature) features.push(feature);
    }

    // Resolve polls
    const polls = await ctx.db
      .query("polls")
      .withIndex("by_communityId", (q) =>
        q.eq("communityId", args.communityId)
      )
      .collect();
    polls.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return {
      ...community,
      features,
      polls,
    };
  },
});

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export const create = mutation({
  args: {
    communityId: v.string(),
    name: v.string(),
    description: v.string(),
    iconUrl: v.string(),
    ownerId: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const id = await ctx.db.insert("communities", {
      ...args,
      memberCount: 1,
      featureIds: [],
      pollIds: [],
      createdAt: now,
      updatedAt: now,
    });
    return await ctx.db.get(id);
  },
});

export const addFeature = mutation({
  args: {
    communityId: v.string(),
    featureId: v.string(),
  },
  handler: async (ctx, args) => {
    const community = await ctx.db
      .query("communities")
      .withIndex("by_communityId", (q) =>
        q.eq("communityId", args.communityId)
      )
      .unique();
    if (!community) return false;
    if (!community.featureIds.includes(args.featureId)) {
      await ctx.db.patch(community._id, {
        featureIds: [...community.featureIds, args.featureId],
        updatedAt: new Date().toISOString(),
      });
    }
    return true;
  },
});

export const addPoll = mutation({
  args: {
    communityId: v.string(),
    pollId: v.string(),
  },
  handler: async (ctx, args) => {
    const community = await ctx.db
      .query("communities")
      .withIndex("by_communityId", (q) =>
        q.eq("communityId", args.communityId)
      )
      .unique();
    if (!community) return false;
    if (!community.pollIds.includes(args.pollId)) {
      await ctx.db.patch(community._id, {
        pollIds: [...community.pollIds, args.pollId],
        updatedAt: new Date().toISOString(),
      });
    }
    return true;
  },
});
