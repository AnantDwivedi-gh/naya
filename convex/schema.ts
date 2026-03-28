import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  features: defineTable({
    // Application-level ID (e.g. "feat_001") — NOT the Convex _id
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
    code: v.object({
      html: v.string(),
      css: v.string(),
      js: v.string(),
    }),
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
    forkCount: v.number(),
    deployCount: v.number(),
    upvotes: v.number(),
    forkedFromId: v.union(v.string(), v.null()),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    ),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_featureId", ["featureId"])
    .index("by_status", ["status"])
    .index("by_authorId", ["authorId"])
    .index("by_category", ["category"]),

  communities: defineTable({
    communityId: v.string(),
    name: v.string(),
    description: v.string(),
    iconUrl: v.string(),
    ownerId: v.string(),
    memberCount: v.number(),
    featureIds: v.array(v.string()),
    pollIds: v.array(v.string()),
    tags: v.array(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_communityId", ["communityId"]),

  polls: defineTable({
    pollId: v.string(),
    communityId: v.string(),
    authorId: v.string(),
    title: v.string(),
    description: v.string(),
    options: v.array(
      v.object({
        id: v.string(),
        label: v.string(),
        votes: v.number(),
        voterIds: v.array(v.string()),
      })
    ),
    status: v.union(v.literal("active"), v.literal("closed")),
    endsAt: v.string(),
    createdAt: v.string(),
  })
    .index("by_pollId", ["pollId"])
    .index("by_communityId", ["communityId"]),

  users: defineTable({
    userId: v.string(),
    username: v.string(),
    displayName: v.string(),
    avatarUrl: v.string(),
    bio: v.string(),
    featureIds: v.array(v.string()),
    communityIds: v.array(v.string()),
    deployedFeatureIds: v.array(v.string()),
    reputation: v.number(),
    createdAt: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_username", ["username"]),

  deviceCapabilities: defineTable({
    deviceId: v.string(),
    userId: v.string(),
    browser: v.string(),
    os: v.string(),
    screenWidth: v.number(),
    screenHeight: v.number(),
    supportedApis: v.array(v.string()),
    extensionsInstalled: v.array(v.string()),
    registeredAt: v.string(),
  })
    .index("by_deviceId", ["deviceId"])
    .index("by_userId", ["userId"]),

  deployments: defineTable({
    deploymentId: v.string(),
    featureId: v.string(),
    userId: v.string(),
    deviceId: v.union(v.string(), v.null()),
    status: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("removed")
    ),
    deployedAt: v.string(),
  })
    .index("by_deploymentId", ["deploymentId"])
    .index("by_featureId", ["featureId"])
    .index("by_userId", ["userId"]),
});
