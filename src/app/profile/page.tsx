"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Layers,
  TrendingUp,
  GitFork,
  Download,
  Star,
  Calendar,
  Settings,
  ExternalLink,
  Zap,
  Code,
  Users,
  Award,
} from "lucide-react";

export default function ProfilePage() {
  const [tab, setTab] = useState<"features" | "deployed" | "communities">("features");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const user = {
    name: "naya.builder",
    bio: "Building the future of app experiences, one overlay at a time.",
    reputation: 7842,
    joined: "January 2024",
    features: 8,
    deployments: 23400,
    contributions: 156,
    communities: 4,
  };

  const userFeatures = [
    { name: "INSTAGRAM FACT CHECKER", votes: 2847, forks: 183, status: "deployed" },
    { name: "TWITTER SENTIMENT LENS", votes: 1203, forks: 67, status: "deployed" },
    { name: "YOUTUBE CHAPTER GENERATOR", votes: 892, forks: 45, status: "active" },
    { name: "LINKEDIN CRINGE FILTER", votes: 2156, forks: 134, status: "deployed" },
    { name: "REDDIT AMA EXTRACTOR", votes: 567, forks: 23, status: "active" },
    { name: "GMAIL UNSUBSCRIBE ALL", votes: 3401, forks: 201, status: "deployed" },
    { name: "DISCORD THREAD DIGEST", votes: 445, forks: 12, status: "draft" },
    { name: "SPOTIFY LYRICS ANALYZER", votes: 789, forks: 56, status: "active" },
  ];

  const achievements = [
    { name: "FIRST DEPLOY", desc: "Deployed your first feature", earned: true },
    { name: "COMMUNITY STARTER", desc: "Created a community", earned: true },
    { name: "FORK MASTER", desc: "Feature forked 100+ times", earned: true },
    { name: "TRENDING", desc: "Feature hit trending page", earned: true },
    { name: "10K DEPLOYS", desc: "Total deployments exceeded 10K", earned: true },
    { name: "POLL WINNER", desc: "Feature won a community poll", earned: false },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="font-mono text-lg font-bold tracking-[0.3em]">
              NAYA<span className="text-red-500">.</span>
            </a>
            <span className="text-white/20 font-mono text-sm">/</span>
            <span className="text-[11px] font-mono tracking-[0.15em] text-white/40">PROFILE</span>
          </div>
          <button className="text-[11px] font-mono tracking-[0.15em] border border-white/10 text-white/50 px-3 py-1.5 hover:text-white hover:border-white/20 transition-colors flex items-center gap-1.5">
            <Settings size={11} /> SETTINGS
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="space-y-4">
            <div className="border border-white/5 p-6 space-y-4">
              <div className="w-20 h-20 bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                <User size={32} className="text-white/20" />
              </div>
              <div className="text-center">
                <h2 className="text-sm font-mono font-bold">@{user.name}</h2>
                <p className="text-[10px] font-mono text-white/30 mt-1">{user.bio}</p>
              </div>
              <div className="flex items-center justify-center gap-1 text-[10px] font-mono text-white/20">
                <Calendar size={10} /> Joined {user.joined}
              </div>
            </div>

            {/* Stats */}
            <div className="border border-white/5 p-5 space-y-3">
              {[
                { label: "REPUTATION", value: user.reputation.toLocaleString(), icon: Award, color: "text-red-500" },
                { label: "FEATURES", value: user.features.toString(), icon: Layers, color: "text-white/50" },
                { label: "DEPLOYMENTS", value: user.deployments.toLocaleString(), icon: Download, color: "text-white/50" },
                { label: "CONTRIBUTIONS", value: user.contributions.toString(), icon: GitFork, color: "text-white/50" },
                { label: "COMMUNITIES", value: user.communities.toString(), icon: Users, color: "text-white/50" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between py-1.5 border-b border-white/[0.03] last:border-0">
                  <span className="text-[9px] font-mono tracking-[0.1em] text-white/20 flex items-center gap-1.5">
                    <stat.icon size={10} className={stat.color} />
                    {stat.label}
                  </span>
                  <span className="text-xs font-mono font-bold">{stat.value}</span>
                </div>
              ))}
            </div>

            {/* Achievements */}
            <div className="border border-white/5 p-5 space-y-3">
              <h3 className="text-[10px] font-mono tracking-[0.2em] text-white/30">ACHIEVEMENTS</h3>
              {achievements.map((a) => (
                <div key={a.name} className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 flex items-center justify-center border ${
                      a.earned ? "border-red-500/30 bg-red-500/10" : "border-white/5 bg-white/[0.02]"
                    }`}
                  >
                    {a.earned ? (
                      <Star size={9} className="text-red-500" />
                    ) : (
                      <Star size={9} className="text-white/10" />
                    )}
                  </div>
                  <div>
                    <p className={`text-[9px] font-mono tracking-[0.1em] ${a.earned ? "text-white/50" : "text-white/15"}`}>
                      {a.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4">
            {/* Tabs */}
            <div className="flex items-center gap-0 border border-white/10">
              {(["features", "deployed", "communities"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 text-[10px] font-mono tracking-[0.15em] py-2.5 transition-colors ${
                    tab === t ? "bg-white/5 text-white" : "text-white/30 hover:text-white/50"
                  }`}
                >
                  {t.toUpperCase()} {t === "features" && `(${userFeatures.length})`}
                </button>
              ))}
            </div>

            {/* Features Grid */}
            {tab === "features" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-white/[0.02]">
                {userFeatures.map((feature, i) => {
                  const statusColor = {
                    deployed: "text-green-500",
                    active: "text-red-500",
                    draft: "text-white/20",
                  }[feature.status];

                  return (
                    <motion.div
                      key={feature.name}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-black border border-white/[0.03] p-4 space-y-3 hover:border-white/10 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-[11px] font-mono font-bold tracking-wide">{feature.name}</h4>
                        <span className={`text-[8px] font-mono tracking-[0.1em] ${statusColor}`}>
                          ● {feature.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-mono text-white/30 flex items-center gap-1">
                          <TrendingUp size={9} /> {feature.votes.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-mono text-white/30 flex items-center gap-1">
                          <GitFork size={9} /> {feature.forks}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {tab === "deployed" && (
              <div className="border border-white/5 p-8 text-center">
                <Zap size={24} className="text-white/10 mx-auto mb-3" />
                <p className="text-xs font-mono text-white/20">
                  4 features currently deployed on your device
                </p>
                <a href="/deploy" className="text-[11px] font-mono text-red-500 hover:text-red-400 mt-2 inline-block">
                  MANAGE DEPLOYMENTS →
                </a>
              </div>
            )}

            {tab === "communities" && (
              <div className="border border-white/5 p-8 text-center">
                <Users size={24} className="text-white/10 mx-auto mb-3" />
                <p className="text-xs font-mono text-white/20">
                  Member of 4 communities
                </p>
                <a href="/community" className="text-[11px] font-mono text-red-500 hover:text-red-400 mt-2 inline-block">
                  VIEW COMMUNITIES →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
