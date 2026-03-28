import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export const list = query({
  args: {
    filter: v.optional(
      v.union(v.literal("trending"), v.literal("new"), v.literal("top"))
    ),
    category: v.optional(v.string()),
    targetApp: v.optional(v.string()),
    search: v.optional(v.string()),
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let results = await ctx.db
      .query("features")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    if (args.category) {
      results = results.filter((f) => f.category === args.category);
    }

    if (args.targetApp) {
      const app = args.targetApp.toLowerCase();
      results = results.filter((f) =>
        f.targetApp.toLowerCase().includes(app)
      );
    }

    if (args.search) {
      const q = args.search.toLowerCase();
      results = results.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          f.tags.some((t) => t.includes(q))
      );
    }

    // Sort
    switch (args.filter) {
      case "trending":
        results.sort(
          (a, b) =>
            b.deployCount + b.upvotes * 2 - (a.deployCount + a.upvotes * 2)
        );
        break;
      case "new":
        results.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "top":
        results.sort((a, b) => b.upvotes - a.upvotes);
        break;
      default:
        results.sort((a, b) => b.deployCount - a.deployCount);
    }

    const page = args.page ?? 1;
    const pageSize = args.pageSize ?? 20;
    const total = results.length;
    const start = (page - 1) * pageSize;
    const paged = results.slice(start, start + pageSize);

    return {
      success: true,
      data: paged,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },
});

export const get = query({
  args: { featureId: v.string() },
  handler: async (ctx, args) => {
    const feature = await ctx.db
      .query("features")
      .withIndex("by_featureId", (q) => q.eq("featureId", args.featureId))
      .unique();
    return feature ?? null;
  },
});

export const getByAuthor = query({
  args: { authorId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("features")
      .withIndex("by_authorId", (q) => q.eq("authorId", args.authorId))
      .collect();
  },
});

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export const create = mutation({
  args: {
    featureId: v.string(),
    name: v.string(),
    description: v.string(),
    targetApp: v.string(),
    category: v.union(
      v.literal("fact-checker"),
      v.literal("workflow-automator"),
      v.literal("content-enhancer"),
      v.literal("data-extractor"),
      v.literal("ui-modifier"),
      v.literal("accessibility"),
      v.literal("productivity"),
      v.literal("entertainment")
    ),
    authorId: v.string(),
    authorName: v.string(),
    code: v.object({ html: v.string(), css: v.string(), js: v.string() }),
    triggerConditions: v.array(
      v.object({
        type: v.union(
          v.literal("url-match"),
          v.literal("element-present"),
          v.literal("page-load"),
          v.literal("user-action"),
          v.literal("schedule")
        ),
        value: v.string(),
        description: v.string(),
      })
    ),
    integrationHooks: v.array(
      v.object({
        type: v.union(
          v.literal("dom-observer"),
          v.literal("network-intercept"),
          v.literal("storage-access"),
          v.literal("api-call")
        ),
        target: v.string(),
        description: v.string(),
      })
    ),
    permissions: v.array(v.string()),
    tags: v.array(v.string()),
    forkedFromId: v.union(v.string(), v.null()),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    ),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const id = await ctx.db.insert("features", {
      ...args,
      forkCount: 0,
      deployCount: 0,
      upvotes: 0,
      createdAt: now,
      updatedAt: now,
    });
    return await ctx.db.get(id);
  },
});

export const update = mutation({
  args: {
    featureId: v.string(),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    code: v.optional(
      v.object({ html: v.string(), css: v.string(), js: v.string() })
    ),
    triggerConditions: v.optional(
      v.array(
        v.object({
          type: v.union(
            v.literal("url-match"),
            v.literal("element-present"),
            v.literal("page-load"),
            v.literal("user-action"),
            v.literal("schedule")
          ),
          value: v.string(),
          description: v.string(),
        })
      )
    ),
    integrationHooks: v.optional(
      v.array(
        v.object({
          type: v.union(
            v.literal("dom-observer"),
            v.literal("network-intercept"),
            v.literal("storage-access"),
            v.literal("api-call")
          ),
          target: v.string(),
          description: v.string(),
        })
      )
    ),
    permissions: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("published"),
        v.literal("archived")
      )
    ),
    category: v.optional(
      v.union(
        v.literal("fact-checker"),
        v.literal("workflow-automator"),
        v.literal("content-enhancer"),
        v.literal("data-extractor"),
        v.literal("ui-modifier"),
        v.literal("accessibility"),
        v.literal("productivity"),
        v.literal("entertainment")
      )
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("features")
      .withIndex("by_featureId", (q) => q.eq("featureId", args.featureId))
      .unique();
    if (!existing) return null;

    const { featureId, ...updates } = args;
    // Remove undefined values
    const cleanUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }
    cleanUpdates.updatedAt = new Date().toISOString();

    await ctx.db.patch(existing._id, cleanUpdates);
    return await ctx.db.get(existing._id);
  },
});

export const remove = mutation({
  args: { featureId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("features")
      .withIndex("by_featureId", (q) => q.eq("featureId", args.featureId))
      .unique();
    if (!existing) return false;
    await ctx.db.delete(existing._id);
    return true;
  },
});

export const fork = mutation({
  args: {
    featureId: v.string(),
    userId: v.string(),
    userName: v.string(),
    newFeatureId: v.string(),
  },
  handler: async (ctx, args) => {
    const original = await ctx.db
      .query("features")
      .withIndex("by_featureId", (q) => q.eq("featureId", args.featureId))
      .unique();
    if (!original) return null;

    // Increment fork count on original
    await ctx.db.patch(original._id, {
      forkCount: original.forkCount + 1,
    });

    const now = new Date().toISOString();
    const id = await ctx.db.insert("features", {
      featureId: args.newFeatureId,
      name: `${original.name} (Fork)`,
      description: original.description,
      targetApp: original.targetApp,
      category: original.category,
      authorId: args.userId,
      authorName: args.userName,
      code: original.code,
      triggerConditions: original.triggerConditions,
      integrationHooks: original.integrationHooks,
      permissions: original.permissions,
      tags: original.tags,
      forkCount: 0,
      deployCount: 0,
      upvotes: 0,
      forkedFromId: args.featureId,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });
    return await ctx.db.get(id);
  },
});

export const deploy = mutation({
  args: {
    featureId: v.string(),
    userId: v.string(),
    deviceId: v.union(v.string(), v.null()),
    deploymentId: v.string(),
  },
  handler: async (ctx, args) => {
    const feature = await ctx.db
      .query("features")
      .withIndex("by_featureId", (q) => q.eq("featureId", args.featureId))
      .unique();
    if (!feature) return null;
    if (feature.status !== "published") return null;

    // Increment deploy count
    await ctx.db.patch(feature._id, {
      deployCount: feature.deployCount + 1,
    });

    // Create deployment record
    const now = new Date().toISOString();
    await ctx.db.insert("deployments", {
      deploymentId: args.deploymentId,
      featureId: args.featureId,
      userId: args.userId,
      deviceId: args.deviceId,
      status: "active",
      deployedAt: now,
    });

    // Add to user's deployed features
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    if (user && !user.deployedFeatureIds.includes(args.featureId)) {
      await ctx.db.patch(user._id, {
        deployedFeatureIds: [...user.deployedFeatureIds, args.featureId],
      });
    }

    return {
      deployment: {
        id: args.deploymentId,
        featureId: args.featureId,
        userId: args.userId,
        deviceId: args.deviceId,
        status: "active" as const,
        deployedAt: now,
      },
      overlayConfig: {
        featureId: feature.featureId,
        featureName: feature.name,
        targetApp: feature.targetApp,
        enabled: true,
        code: feature.code,
        triggerConditions: feature.triggerConditions,
        integrationHooks: feature.integrationHooks,
        permissions: feature.permissions,
        userSettings: {},
      },
    };
  },
});

export const upvote = mutation({
  args: { featureId: v.string() },
  handler: async (ctx, args) => {
    const feature = await ctx.db
      .query("features")
      .withIndex("by_featureId", (q) => q.eq("featureId", args.featureId))
      .unique();
    if (!feature) return null;
    await ctx.db.patch(feature._id, { upvotes: feature.upvotes + 1 });
    return { upvotes: feature.upvotes + 1 };
  },
});
