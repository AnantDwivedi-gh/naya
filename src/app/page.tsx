"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  TrendingUp,
  Users,
  Plus,
  ArrowRight,
  Terminal,
  Layers,
  GitFork,
  Vote,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api-client";
import type { Feature } from "@/lib/data/types";
import { UserMenu } from "@/components/auth/user-menu";

// Static fallback features shown when the API is unreachable or returns empty
const FALLBACK_FEATURES: Feature[] = [
  {
    id: "feat_001",
    name: "Instagram Fact Checker",
    description:
      "Overlays fact-check badges on Instagram posts by cross-referencing claims with trusted databases.",
    targetApp: "instagram.com",
    category: "fact-checker",
    authorId: "user_001",
    authorName: "VerifyBot",
    code: { html: "", css: "", js: "" },
    triggerConditions: [],
    integrationHooks: [],
    permissions: ["dom-read", "network-request"],
    tags: ["fact-check", "instagram"],
    forkCount: 42,
    deployCount: 1580,
    upvotes: 312,
    forkedFromId: null,
    status: "published",
    createdAt: "2025-11-15T10:30:00Z",
    updatedAt: "2026-02-20T14:15:00Z",
  },
  {
    id: "feat_002",
    name: "Twitter Thread Summarizer",
    description:
      "Collapses long Twitter/X threads into concise key-point summaries using NLP.",
    targetApp: "x.com",
    category: "content-enhancer",
    authorId: "user_002",
    authorName: "ThreadWise",
    code: { html: "", css: "", js: "" },
    triggerConditions: [],
    integrationHooks: [],
    permissions: ["dom-read"],
    tags: ["twitter", "summarizer"],
    forkCount: 67,
    deployCount: 2340,
    upvotes: 489,
    forkedFromId: null,
    status: "published",
    createdAt: "2025-10-20T08:00:00Z",
    updatedAt: "2026-01-10T11:45:00Z",
  },
  {
    id: "feat_003",
    name: "YouTube Ad Skipper",
    description:
      "Automatically detects ad segments in YouTube videos and marks them on the progress bar.",
    targetApp: "youtube.com",
    category: "workflow-automator",
    authorId: "user_003",
    authorName: "SkipMaster",
    code: { html: "", css: "", js: "" },
    triggerConditions: [],
    integrationHooks: [],
    permissions: ["dom-read", "dom-write"],
    tags: ["youtube", "ads", "automation"],
    forkCount: 89,
    deployCount: 4120,
    upvotes: 621,
    forkedFromId: null,
    status: "published",
    createdAt: "2025-09-05T14:20:00Z",
    updatedAt: "2026-01-28T09:30:00Z",
  },
  {
    id: "feat_004",
    name: "LinkedIn Post Formatter",
    description:
      "Auto-formats LinkedIn posts for readability with proper line breaks and highlights.",
    targetApp: "linkedin.com",
    category: "content-enhancer",
    authorId: "user_004",
    authorName: "PostPro",
    code: { html: "", css: "", js: "" },
    triggerConditions: [],
    integrationHooks: [],
    permissions: ["dom-read", "dom-write"],
    tags: ["linkedin", "formatting"],
    forkCount: 23,
    deployCount: 890,
    upvotes: 178,
    forkedFromId: null,
    status: "published",
    createdAt: "2025-12-01T16:00:00Z",
    updatedAt: "2026-02-15T11:00:00Z",
  },
  {
    id: "feat_005",
    name: "Reddit Sentiment Analyzer",
    description:
      "Adds sentiment analysis badges to Reddit comments showing positive, negative, or neutral tone.",
    targetApp: "reddit.com",
    category: "data-extractor",
    authorId: "user_005",
    authorName: "SentiBot",
    code: { html: "", css: "", js: "" },
    triggerConditions: [],
    integrationHooks: [],
    permissions: ["dom-read"],
    tags: ["reddit", "sentiment", "nlp"],
    forkCount: 31,
    deployCount: 1200,
    upvotes: 245,
    forkedFromId: null,
    status: "published",
    createdAt: "2025-11-20T09:00:00Z",
    updatedAt: "2026-03-01T08:00:00Z",
  },
  {
    id: "feat_006",
    name: "Gmail Priority Inbox",
    description:
      "Automatically categorizes and prioritizes your Gmail inbox by urgency using AI classification.",
    targetApp: "gmail.com",
    category: "productivity",
    authorId: "user_006",
    authorName: "InboxZero",
    code: { html: "", css: "", js: "" },
    triggerConditions: [],
    integrationHooks: [],
    permissions: ["dom-read", "dom-write"],
    tags: ["gmail", "productivity", "email"],
    forkCount: 55,
    deployCount: 2800,
    upvotes: 402,
    forkedFromId: null,
    status: "published",
    createdAt: "2025-10-10T12:00:00Z",
    updatedAt: "2026-02-28T15:30:00Z",
  },
];

const STATS = [
  { label: "FEATURES CREATED", value: "12,847", icon: Layers },
  { label: "ACTIVE USERS", value: "48,293", icon: Users },
  { label: "DEPLOYMENTS", value: "89,102", icon: Zap },
  { label: "COMMUNITIES", value: "1,247", icon: GitFork },
];

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const statusColor = feature.status === "published" ? "text-red-500" : "text-white/60";

  return (
    <motion.a
      href={`/feature/${feature.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      className="block border border-white/10 bg-black hover:border-white/30 transition-colors duration-200 group cursor-pointer"
    >
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] tracking-[0.2em] text-white/40 font-mono">
            {feature.targetApp.toUpperCase()}
          </span>
          <span className={`text-[10px] tracking-[0.15em] font-mono ${statusColor}`}>
            [{feature.status.toUpperCase()}]
          </span>
        </div>

        <h3 className="text-sm font-mono font-bold tracking-wide text-white group-hover:text-red-500 transition-colors">
          {feature.name.toUpperCase()}
        </h3>

        <p className="text-xs font-mono text-white/50 leading-relaxed">
          {feature.description}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <span className="text-[10px] font-mono text-white/30">@{feature.authorName}</span>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-white/40 flex items-center gap-1">
              <TrendingUp size={10} /> {feature.upvotes}
            </span>
            <span className="text-[10px] font-mono text-white/40 flex items-center gap-1">
              <GitFork size={10} /> {feature.forkCount}
            </span>
          </div>
        </div>
      </div>
    </motion.a>
  );
}

function FeatureCardSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className="border border-white/5 bg-black p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="h-2 w-16 bg-white/5 animate-pulse" />
        <div className="h-2 w-12 bg-white/5 animate-pulse" />
      </div>
      <div className="h-3 w-3/4 bg-white/5 animate-pulse" />
      <div className="space-y-1">
        <div className="h-2 w-full bg-white/[0.03] animate-pulse" />
        <div className="h-2 w-2/3 bg-white/[0.03] animate-pulse" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="h-2 w-16 bg-white/[0.03] animate-pulse" />
        <div className="h-2 w-20 bg-white/[0.03] animate-pulse" />
      </div>
    </motion.div>
  );
}

function CommandPrompt() {
  const [input, setInput] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const placeholders = [
    "fact-check Instagram posts in my feed...",
    "summarize any YouTube video I'm watching...",
    "auto-format LinkedIn posts to be readable...",
    "create a workflow to turn tweets into blog posts...",
    "add sentiment analysis to Reddit comments...",
    "prioritize my Gmail inbox by urgency...",
  ];

  useEffect(() => {
    let currentIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timeout: NodeJS.Timeout;

    const type = () => {
      const current = placeholders[currentIndex];

      if (!isDeleting) {
        setPlaceholder(current.slice(0, charIndex + 1));
        charIndex++;

        if (charIndex === current.length) {
          isDeleting = true;
          timeout = setTimeout(type, 2000);
          return;
        }
      } else {
        setPlaceholder(current.slice(0, charIndex - 1));
        charIndex--;

        if (charIndex === 0) {
          isDeleting = false;
          currentIndex = (currentIndex + 1) % placeholders.length;
        }
      }

      timeout = setTimeout(type, isDeleting ? 30 : 60);
    };

    timeout = setTimeout(type, 1000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="border border-white/20 bg-black/80 backdrop-blur-sm hover:border-red-500/50 transition-colors duration-300">
      <div className="flex items-center gap-2 px-4 py-1.5 border-b border-white/5">
        <Terminal size={12} className="text-red-500" />
        <span className="text-[10px] font-mono tracking-[0.2em] text-white/40">
          NAYA://CREATE-FEATURE
        </span>
      </div>
      <div className="flex items-center">
        <span className="text-red-500 font-mono text-sm pl-4 select-none">&gt;</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-white font-mono text-sm px-3 py-4 outline-none placeholder:text-white/20"
          onKeyDown={(e) => {
            if (e.key === "Enter" && input.trim()) {
              window.location.href = `/create?prompt=${encodeURIComponent(input)}`;
            }
          }}
        />
        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-4 text-white/40 hover:text-red-500 transition-colors"
          onClick={() => {
            if (input.trim()) {
              window.location.href = `/create?prompt=${encodeURIComponent(input)}`;
            }
          }}
        >
          <ArrowRight size={16} />
        </motion.button>
      </div>
    </div>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [trendingFeatures, setTrendingFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);

    api.features
      .list({ filter: "trending", pageSize: 6 })
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setTrendingFeatures(res.data);
        } else {
          // Empty response — use fallback
          setTrendingFeatures(FALLBACK_FEATURES);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch trending features:", err);
        // API error — use fallback static features
        setTrendingFeatures(FALLBACK_FEATURES);
      })
      .finally(() => setLoading(false));
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="font-mono text-lg font-bold tracking-[0.3em]">
              NAYA<span className="text-red-500">.</span>
            </h1>
            <nav className="hidden md:flex items-center gap-6">
              {["EXPLORE", "COMMUNITY", "CREATE", "DEPLOY"].map((item) => (
                <a
                  key={item}
                  href={`/${item.toLowerCase()}`}
                  className="text-[11px] font-mono tracking-[0.15em] text-white/40 hover:text-white transition-colors"
                >
                  {item}
                </a>
              ))}
            </nav>
          </div>
          <UserMenu />
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl space-y-6"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500" />
            <span className="text-[10px] font-mono tracking-[0.3em] text-white/40">
              THE FEATURE LAYER FOR EVERY APP
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-mono font-bold leading-[1.1] tracking-tight">
            BUILD FEATURES
            <br />
            <span className="text-white/20">FOR ANY APP.</span>
            <br />
            <span className="text-red-500">SHARE WITH</span>
            <br />
            <span className="text-red-500">EVERYONE.</span>
          </h2>

          <p className="text-sm font-mono text-white/40 max-w-xl leading-relaxed">
            Describe what you want. Naya builds it. Deploy AI-powered features
            on top of any application. Fork from the community. Vote on what
            ships next. Your apps, your rules.
          </p>
        </motion.div>

        {/* Command Prompt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-12 max-w-2xl"
        >
          <CommandPrompt />
        </motion.div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="space-y-1"
            >
              <div className="flex items-center gap-2">
                <stat.icon size={12} className="text-red-500" />
                <span className="text-[10px] font-mono tracking-[0.2em] text-white/30">
                  {stat.label}
                </span>
              </div>
              <p className="text-2xl font-mono font-bold">{stat.value}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trending Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <TrendingUp size={14} className="text-red-500" />
            <h3 className="text-sm font-mono tracking-[0.2em] font-bold">
              TRENDING FEATURES
            </h3>
            {loading && <Loader2 size={12} className="text-white/30 animate-spin" />}
          </div>
          <a
            href="/explore"
            className="text-[11px] font-mono tracking-[0.15em] text-white/40 hover:text-red-500 transition-colors flex items-center gap-1"
          >
            VIEW ALL <ArrowRight size={10} />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-white/5">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <FeatureCardSkeleton key={i} index={i} />
              ))
            : trendingFeatures.map((feature, i) => (
                <FeatureCard key={feature.id} feature={feature} index={i} />
              ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-2 h-2 bg-red-500" />
            <h3 className="text-sm font-mono tracking-[0.2em] font-bold">
              HOW IT WORKS
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "DESCRIBE",
                desc: "Tell Naya what feature you want. Natural language. Any app. Any capability.",
                icon: Terminal,
              },
              {
                step: "02",
                title: "GENERATE",
                desc: "AI builds your feature as an overlay widget. Review, tweak, and test instantly.",
                icon: Zap,
              },
              {
                step: "03",
                title: "DEPLOY & SHARE",
                desc: "Run it on your device. Share with communities. Let others vote and fork.",
                icon: Users,
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-mono font-bold text-white/10">
                    {item.step}
                  </span>
                  <item.icon size={16} className="text-red-500" />
                </div>
                <h4 className="text-sm font-mono font-bold tracking-[0.2em]">
                  {item.title}
                </h4>
                <p className="text-xs font-mono text-white/40 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community CTA */}
      <section className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="border border-white/10 p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Vote size={14} className="text-red-500" />
                <span className="text-[10px] font-mono tracking-[0.2em] text-white/40">
                  COMMUNITY POLLS
                </span>
              </div>
              <h3 className="text-xl font-mono font-bold">
                VOTE ON WHAT SHIPS NEXT<span className="text-red-500">.</span>
              </h3>
              <p className="text-xs font-mono text-white/40 max-w-md leading-relaxed">
                Communities collectively decide which features get deployed.
                Create polls, gather votes, and ship features that people
                actually want.
              </p>
            </div>
            <a
              href="/community"
              className="text-[11px] font-mono tracking-[0.15em] bg-red-500 text-black px-6 py-3 hover:bg-red-400 transition-colors flex items-center gap-2"
            >
              JOIN A COMMUNITY <ArrowRight size={12} />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold tracking-[0.3em]">
              NAYA<span className="text-red-500">.</span>
            </span>
            <span className="text-[10px] font-mono text-white/20">
              // THE FEATURE LAYER
            </span>
          </div>
          <div className="flex items-center gap-6">
            {["DOCS", "GITHUB", "DISCORD", "TWITTER"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-[10px] font-mono tracking-[0.15em] text-white/30 hover:text-white/60 transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
