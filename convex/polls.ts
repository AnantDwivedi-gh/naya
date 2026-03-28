import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export const listByCommunity = query({
  args: { communityId: v.string() },
  handler: async (ctx, args) => {
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
    return polls;
  },
});

export const get = query({
  args: { pollId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("polls")
      .withIndex("by_pollId", (q) => q.eq("pollId", args.pollId))
      .unique();
  },
});

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export const create = mutation({
  args: {
    pollId: v.string(),
    communityId: v.string(),
    authorId: v.string(),
    title: v.string(),
    description: v.string(),
    optionLabels: v.array(v.string()),
    status: v.union(v.literal("active"), v.literal("closed")),
    endsAt: v.string(),
  },
  handler: async (ctx, args) => {
    const options = args.optionLabels.map((label, i) => ({
      id: `opt_${args.pollId.replace("poll_", "")}_${String.fromCharCode(97 + i)}`,
      label,
      votes: 0,
      voterIds: [] as string[],
    }));

    const now = new Date().toISOString();
    const id = await ctx.db.insert("polls", {
      pollId: args.pollId,
      communityId: args.communityId,
      authorId: args.authorId,
      title: args.title,
      description: args.description,
      options,
      status: args.status,
      endsAt: args.endsAt,
      createdAt: now,
    });
    return await ctx.db.get(id);
  },
});

export const vote = mutation({
  args: {
    pollId: v.string(),
    optionId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const poll = await ctx.db
      .query("polls")
      .withIndex("by_pollId", (q) => q.eq("pollId", args.pollId))
      .unique();
    if (!poll) return { success: false, error: "Poll not found" };

    if (poll.status !== "active") {
      return { success: false, error: "Poll is closed" };
    }

    if (new Date(poll.endsAt) < new Date()) {
      await ctx.db.patch(poll._id, { status: "closed" });
      return { success: false, error: "Poll has ended" };
    }

    // Check duplicate vote
    const alreadyVoted = poll.options.some((opt) =>
      opt.voterIds.includes(args.userId)
    );
    if (alreadyVoted) {
      return { success: false, error: "User has already voted on this poll" };
    }

    const optionIndex = poll.options.findIndex(
      (opt) => opt.id === args.optionId
    );
    if (optionIndex === -1) return { success: false, error: "Option not found" };

    const updatedOptions = poll.options.map((opt, i) =>
      i === optionIndex
        ? {
            ...opt,
            votes: opt.votes + 1,
            voterIds: [...opt.voterIds, args.userId],
          }
        : opt
    );

    await ctx.db.patch(poll._id, { options: updatedOptions });

    const updatedPoll = await ctx.db.get(poll._id);
    const total = updatedOptions.reduce((sum, opt) => sum + opt.votes, 0);

    return {
      success: true,
      poll: updatedPoll,
      results: {
        total,
        options: updatedOptions.map((opt) => ({
          id: opt.id,
          label: opt.label,
          votes: opt.votes,
          percentage:
            total > 0 ? Math.round((opt.votes / total) * 1000) / 10 : 0,
        })),
      },
    };
  },
});
