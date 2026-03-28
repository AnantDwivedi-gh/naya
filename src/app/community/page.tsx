"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Vote,
  Layers,
  TrendingUp,
  ArrowRight,
  Plus,
  Clock,
  Check,
  Zap,
  GitFork,
  MessageSquare,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api-client";
import type { Community, Poll } from "@/lib/data/types";

function CommunityCardSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.06 }}
      className="block border border-white/5 bg-black p-5 space-y-4"
    >
      <div className="h-3 w-3/4 bg-white/5 animate-pulse" />
      <div className="space-y-1">
        <div className="h-2 w-full bg-white/[0.03] animate-pulse" />
        <div className="h-2 w-2/3 bg-white/[0.03] animate-pulse" />
      </div>
      <div className="flex gap-2">
        <div className="h-3 w-12 bg-white/[0.03] animate-pulse" />
        <div className="h-3 w-12 bg-white/[0.03] animate-pulse" />
      </div>
      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/5">
        <div className="h-6 bg-white/[0.03] animate-pulse" />
        <div className="h-6 bg-white/[0.03] animate-pulse" />
        <div className="h-6 bg-white/[0.03] animate-pulse" />
      </div>
    </motion.div>
  );
}

function CommunityCard({ community, index }: { community: Community; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="block border border-white/5 bg-black hover:border-white/20 transition-all group"
    >
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="text-xs font-mono font-bold tracking-[0.15em] text-white group-hover:text-red-500 transition-colors">
            {community.name.toUpperCase()}
          </h3>
          {community.pollIds.length > 0 && (
            <span className="text-[9px] font-mono bg-red-500/10 text-red-500 px-2 py-0.5 flex items-center gap-1">
              <Vote size={8} /> {community.pollIds.length} POLLS
            </span>
          )}
        </div>

        <p className="text-[11px] font-mono text-white/40 leading-relaxed">
          {community.description}
        </p>

        <div className="flex items-center gap-2">
          {community.tags.map((tag) => (
            <span
              key={tag}
              className="text-[8px] font-mono tracking-[0.1em] text-white/20 border border-white/5 px-1.5 py-0.5"
            >
              {tag.toUpperCase()}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/5">
          <div>
            <p className="text-sm font-mono font-bold">{community.memberCount.toLocaleString()}</p>
            <p className="text-[9px] font-mono text-white/25 tracking-[0.1em]">MEMBERS</p>
          </div>
          <div>
            <p className="text-sm font-mono font-bold">{community.featureIds.length}</p>
            <p className="text-[9px] font-mono text-white/25 tracking-[0.1em]">FEATURES</p>
          </div>
          <div>
            <p className="text-sm font-mono font-bold text-red-500">{community.pollIds.length}</p>
            <p className="text-[9px] font-mono text-white/25 tracking-[0.1em]">POLLS</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PollCard({
  poll,
  communityName,
  index,
  onVote,
  votedPolls,
}: {
  poll: Poll;
  communityName: string;
  index: number;
  onVote: (pollId: string, optionId: string) => Promise<void>;
  votedPolls: Set<string>;
}) {
  const [voting, setVoting] = useState<string | null>(null);
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
  const hasVoted = votedPolls.has(poll.id);

  const isActive = poll.status === "active" && new Date(poll.endsAt) > new Date();

  const handleVote = async (optionId: string) => {
    setVoting(optionId);
    try {
      await onVote(poll.id, optionId);
    } finally {
      setVoting(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="border border-white/5 bg-black hover:border-white/15 transition-all"
    >
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono tracking-[0.15em] text-white/25">
            {communityName.toUpperCase()}
          </span>
          <span
            className={`text-[9px] font-mono tracking-[0.15em] flex items-center gap-1 ${
              isActive ? "text-red-500" : poll.status === "closed" ? "text-white/30" : "text-green-500"
            }`}
          >
            {isActive && <span className="w-1.5 h-1.5 bg-red-500 animate-pulse inline-block" />}
            {!isActive && poll.status === "closed" && <Check size={9} />}
            {isActive ? "ACTIVE" : "CLOSED"}
          </span>
        </div>

        <div>
          <h3 className="text-xs font-mono font-bold tracking-wide text-white">
            {poll.title}
          </h3>
          <p className="text-[10px] font-mono text-white/35 mt-1 leading-relaxed">
            {poll.description}
          </p>
        </div>

        {/* Options with vote bars */}
        <div className="space-y-2">
          {poll.options.map((option) => {
            const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
            return (
              <div key={option.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-white/50">{option.label}</span>
                  <span className="text-[9px] font-mono text-white/30">{percentage}%</span>
                </div>
                <div className="h-1 bg-white/5 relative overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
                    className="absolute inset-y-0 left-0 bg-red-500"
                  />
                </div>
                {isActive && !hasVoted && (
                  <button
                    onClick={() => handleVote(option.id)}
                    disabled={voting !== null}
                    className="text-[9px] font-mono text-white/20 hover:text-red-500 transition-colors disabled:opacity-30"
                  >
                    {voting === option.id ? (
                      <span className="flex items-center gap-1">
                        <Loader2 size={8} className="animate-spin" /> VOTING...
                      </span>
                    ) : (
                      "VOTE"
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {hasVoted && (
          <div className="flex items-center gap-1 text-[9px] font-mono text-green-500">
            <Check size={9} /> YOU VOTED
          </div>
        )}

        <div className="flex items-center justify-between text-[9px] font-mono text-white/15">
          <span className="flex items-center gap-1">
            <Clock size={9} /> ENDS: {new Date(poll.endsAt).toLocaleDateString()}
          </span>
          <span>{totalVotes.toLocaleString()} VOTES</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function CommunityPage() {
  const [tab, setTab] = useState<"communities" | "polls">("communities");
  const [mounted, setMounted] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [communityMap, setCommunityMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [pollsLoading, setPollsLoading] = useState(false);
  const [votedPolls, setVotedPolls] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);

    // Load voted polls from localStorage
    try {
      const stored = JSON.parse(localStorage.getItem("naya_voted_polls") || "[]");
      setVotedPolls(new Set(stored));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchCommunities = async () => {
      setLoading(true);
      try {
        const result = await api.communities.list({ pageSize: 50 });
        setCommunities(result.data);

        // Build name map
        const nameMap: Record<string, string> = {};
        result.data.forEach((c) => {
          nameMap[c.id] = c.name;
        });
        setCommunityMap(nameMap);
      } catch (err) {
        console.error("Failed to fetch communities:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, [mounted]);

  // Fetch polls when switching to polls tab
  useEffect(() => {
    if (!mounted || tab !== "polls" || communities.length === 0) return;

    const fetchAllPolls = async () => {
      setPollsLoading(true);
      try {
        const allPolls: Poll[] = [];
        // Fetch polls from all communities
        for (const community of communities) {
          if (community.pollIds.length > 0) {
            try {
              const communityPolls = await api.polls.listByCommunity(community.id);
              allPolls.push(...communityPolls);
            } catch {
              // Some communities might not have polls endpoint
            }
          }
        }
        setPolls(allPolls);
      } catch (err) {
        console.error("Failed to fetch polls:", err);
      } finally {
        setPollsLoading(false);
      }
    };

    if (polls.length === 0) {
      fetchAllPolls();
    }
  }, [tab, mounted, communities]);

  const handleVote = async (pollId: string, optionId: string) => {
    const poll = polls.find((p) => p.id === pollId);
    if (!poll) return;

    try {
      await api.polls.vote(poll.communityId, pollId, optionId, "user_anonymous");

      // Update local state
      setPolls((prev) =>
        prev.map((p) => {
          if (p.id !== pollId) return p;
          return {
            ...p,
            options: p.options.map((opt) =>
              opt.id === optionId
                ? { ...opt, votes: opt.votes + 1 }
                : opt
            ),
          };
        })
      );

      // Mark as voted
      setVotedPolls((prev) => {
        const next = new Set(prev);
        next.add(pollId);
        localStorage.setItem("naya_voted_polls", JSON.stringify([...next]));
        return next;
      });
    } catch (err) {
      console.error("Vote failed:", err);
    }
  };

  if (!mounted) return null;

  const totalPolls = communities.reduce((sum, c) => sum + c.pollIds.length, 0);
  const totalFeatures = communities.reduce((sum, c) => sum + c.featureIds.length, 0);
  const totalMembers = communities.reduce((sum, c) => sum + c.memberCount, 0);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="font-mono text-lg font-bold tracking-[0.3em]">
              NAYA<span className="text-red-500">.</span>
            </a>
            <span className="text-white/20 font-mono text-sm">/</span>
            <span className="text-[11px] font-mono tracking-[0.15em] text-white/40">
              COMMUNITY
            </span>
          </div>
          <button className="text-[11px] font-mono tracking-[0.15em] bg-red-500 text-black px-4 py-2 hover:bg-red-400 transition-colors flex items-center gap-1.5">
            <Plus size={11} /> CREATE COMMUNITY
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 border border-white/5 p-6">
          {[
            { label: "COMMUNITIES", value: communities.length.toString(), icon: Users },
            { label: "ACTIVE POLLS", value: totalPolls.toString(), icon: Vote },
            { label: "FEATURES", value: totalFeatures.toString(), icon: Layers },
            { label: "TOTAL MEMBERS", value: totalMembers.toLocaleString(), icon: TrendingUp },
          ].map((stat) => (
            <div key={stat.label} className="space-y-1">
              <div className="flex items-center gap-1.5">
                <stat.icon size={11} className="text-red-500" />
                <span className="text-[9px] font-mono tracking-[0.15em] text-white/25">
                  {stat.label}
                </span>
              </div>
              <p className="text-xl font-mono font-bold">
                {loading ? (
                  <span className="inline-block w-12 h-5 bg-white/5 animate-pulse" />
                ) : (
                  stat.value
                )}
              </p>
            </div>
          ))}
        </div>

        {/* Tab Switch */}
        <div className="flex items-center gap-0 border border-white/10 mb-8 max-w-xs">
          {(["communities", "polls"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 text-[10px] font-mono tracking-[0.15em] py-2.5 transition-colors flex items-center justify-center gap-1.5 ${
                tab === t ? "bg-white/5 text-white" : "text-white/30 hover:text-white/50"
              }`}
            >
              {t === "communities" ? <Users size={10} /> : <Vote size={10} />}
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === "communities" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-white/[0.02]">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <CommunityCardSkeleton key={i} index={i} />
                ))
              : communities.map((community, i) => (
                  <CommunityCard key={community.id} community={community} index={i} />
                ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pollsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border border-white/5 bg-black p-5 space-y-3">
                  <div className="h-3 w-1/2 bg-white/5 animate-pulse" />
                  <div className="h-2 w-full bg-white/[0.03] animate-pulse" />
                  <div className="h-2 w-3/4 bg-white/[0.03] animate-pulse" />
                  <div className="h-6 w-full bg-white/[0.03] animate-pulse" />
                </div>
              ))
            ) : polls.length === 0 ? (
              <div className="col-span-2 text-center py-12">
                <Vote size={24} className="text-white/10 mx-auto mb-3" />
                <p className="text-xs font-mono text-white/20">NO ACTIVE POLLS</p>
              </div>
            ) : (
              polls.map((poll, i) => (
                <PollCard
                  key={poll.id}
                  poll={poll}
                  communityName={communityMap[poll.communityId] || "COMMUNITY"}
                  index={i}
                  onVote={handleVote}
                  votedPolls={votedPolls}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
