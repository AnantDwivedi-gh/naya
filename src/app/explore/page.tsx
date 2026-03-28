"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  TrendingUp,
  Clock,
  Star,
  Filter,
  Layers,
  GitFork,
  Zap,
  ArrowRight,
  Download,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api-client";
import type { Feature, FeatureCategory } from "@/lib/data/types";
import { NavHeader } from "@/components/layout/nav-header";

const CATEGORIES: { key: FeatureCategory | "ALL"; label: string }[] = [
  { key: "ALL", label: "ALL" },
  { key: "fact-checker", label: "FACT-CHECK" },
  { key: "content-enhancer", label: "ENHANCE" },
  { key: "workflow-automator", label: "AUTOMATE" },
  { key: "data-extractor", label: "EXTRACT" },
  { key: "productivity", label: "PRODUCTIVITY" },
  { key: "entertainment", label: "ENTERTAINMENT" },
  { key: "ui-modifier", label: "UI-MOD" },
  { key: "accessibility", label: "A11Y" },
];

const TARGET_APPS = [
  "ALL APPS",
  "INSTAGRAM",
  "TWITTER/X",
  "YOUTUBE",
  "LINKEDIN",
  "REDDIT",
  "TIKTOK",
  "GMAIL",
  "SPOTIFY",
  "GITHUB",
];

const SORT_OPTIONS = [
  { key: "trending", label: "TRENDING", icon: TrendingUp },
  { key: "new", label: "NEWEST", icon: Clock },
  { key: "top", label: "TOP RATED", icon: Star },
] as const;

function FeatureCardSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.04 }}
      className="block border border-white/5 bg-black p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="h-2 w-20 bg-white/5 animate-pulse" />
        <div className="h-2 w-14 bg-white/5 animate-pulse" />
      </div>
      <div className="h-3 w-3/4 bg-white/5 animate-pulse" />
      <div className="space-y-1">
        <div className="h-2 w-full bg-white/[0.03] animate-pulse" />
        <div className="h-2 w-2/3 bg-white/[0.03] animate-pulse" />
      </div>
      <div className="flex gap-2">
        <div className="h-3 w-12 bg-white/[0.03] animate-pulse" />
        <div className="h-3 w-12 bg-white/[0.03] animate-pulse" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="h-2 w-16 bg-white/[0.03] animate-pulse" />
        <div className="h-2 w-24 bg-white/[0.03] animate-pulse" />
      </div>
    </motion.div>
  );
}

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const statusColors: Record<string, string> = {
    published: "text-green-500",
    draft: "text-white/30",
    archived: "text-white/20",
  };

  return (
    <motion.a
      href={`/feature/${feature.id}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className="block border border-white/5 bg-black hover:border-white/20 transition-all duration-200 group"
    >
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[9px] tracking-[0.2em] text-white/30 font-mono">
              {feature.targetApp.toUpperCase()}
            </span>
            <span className="text-white/10">&middot;</span>
            <span className="text-[9px] tracking-[0.2em] text-white/20 font-mono">
              {feature.category.toUpperCase()}
            </span>
          </div>
          <span className={`text-[9px] tracking-[0.15em] font-mono ${statusColors[feature.status] || "text-white/30"}`}>
            ● {feature.status.toUpperCase()}
          </span>
        </div>

        <h3 className="text-xs font-mono font-bold tracking-wide text-white group-hover:text-red-500 transition-colors">
          {feature.name.toUpperCase()}
        </h3>

        <p className="text-[11px] font-mono text-white/40 leading-relaxed line-clamp-2">
          {feature.description}
        </p>

        <div className="flex items-center gap-2 pt-1">
          {feature.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[8px] font-mono tracking-[0.1em] text-white/20 border border-white/5 px-1.5 py-0.5"
            >
              {tag.toUpperCase()}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <span className="text-[10px] font-mono text-white/25">@{feature.authorName}</span>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono text-white/30 flex items-center gap-1">
              <TrendingUp size={9} /> {feature.upvotes.toLocaleString()}
            </span>
            <span className="text-[10px] font-mono text-white/30 flex items-center gap-1">
              <GitFork size={9} /> {feature.forkCount}
            </span>
            <span className="text-[10px] font-mono text-white/30 flex items-center gap-1">
              <Download size={9} /> {feature.deployCount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </motion.a>
  );
}

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<FeatureCategory | "ALL">("ALL");
  const [targetApp, setTargetApp] = useState("ALL APPS");
  const [sort, setSort] = useState<"trending" | "new" | "top">("trending");
  const [mounted, setMounted] = useState(false);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchFeatures = useCallback(async () => {
    setLoading(true);
    try {
      const appFilter =
        targetApp === "ALL APPS"
          ? undefined
          : targetApp.toLowerCase();

      const result = await api.features.list({
        filter: sort,
        category: category === "ALL" ? undefined : category,
        targetApp: appFilter,
        search: search || undefined,
        pageSize: 50,
      });

      setFeatures(result.data);
      setTotal(result.meta.total);
    } catch (err) {
      console.error("Failed to fetch features:", err);
    } finally {
      setLoading(false);
    }
  }, [sort, category, targetApp, search]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchFeatures();
    }
  }, [mounted, fetchFeatures]);

  // Debounce search
  useEffect(() => {
    if (!mounted) return;
    const timeout = setTimeout(() => {
      fetchFeatures();
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      <NavHeader activePage="explore" breadcrumbs={[{ label: "EXPLORE" }]} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="border border-white/10 flex items-center mb-6">
          <Search size={14} className="text-white/30 ml-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search features..."
            className="flex-1 bg-transparent text-sm font-mono text-white px-3 py-3 outline-none placeholder:text-white/20"
          />
          <span className="text-[10px] font-mono text-white/20 pr-4 flex items-center gap-2">
            {loading && <Loader2 size={10} className="animate-spin" />}
            {total} RESULTS
          </span>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-8">
          {/* Categories */}
          <div className="flex items-center gap-1 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className={`text-[9px] font-mono tracking-[0.1em] px-2.5 py-1.5 transition-colors ${
                  category === cat.key
                    ? "bg-red-500 text-black"
                    : "text-white/30 hover:text-white/60 border border-white/5 hover:border-white/10"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* App Filter */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 text-[10px] font-mono tracking-[0.1em] text-white/30 border border-white/5 px-2.5 py-1.5 hover:border-white/10 transition-colors">
                <Filter size={10} />
                {targetApp}
                <ChevronDown size={9} />
              </button>
              <div className="absolute top-full right-0 mt-1 border border-white/10 bg-black z-10 hidden group-hover:block min-w-[140px]">
                {TARGET_APPS.map((app) => (
                  <button
                    key={app}
                    onClick={() => setTargetApp(app)}
                    className={`block w-full text-left px-3 py-1.5 text-[10px] font-mono hover:bg-white/5 transition-colors ${
                      targetApp === app ? "text-red-500" : "text-white/40"
                    }`}
                  >
                    {app}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="flex items-center border border-white/5">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSort(opt.key)}
                  className={`text-[9px] font-mono tracking-[0.1em] px-2.5 py-1.5 flex items-center gap-1 transition-colors ${
                    sort === opt.key ? "text-white bg-white/5" : "text-white/25 hover:text-white/40"
                  }`}
                >
                  <opt.icon size={9} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-white/[0.02]">
          {loading
            ? Array.from({ length: 9 }).map((_, i) => (
                <FeatureCardSkeleton key={i} index={i} />
              ))
            : features.map((feature, i) => (
                <FeatureCard key={feature.id} feature={feature} index={i} />
              ))}
        </div>

        {!loading && features.length === 0 && (
          <div className="text-center py-20">
            <p className="text-sm font-mono text-white/20">NO FEATURES FOUND</p>
            <a
              href="/create"
              className="inline-flex items-center gap-1.5 text-[11px] font-mono text-red-500 mt-3 hover:text-red-400"
            >
              CREATE ONE <ArrowRight size={10} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
