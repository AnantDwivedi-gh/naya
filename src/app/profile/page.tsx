"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Layers,
  TrendingUp,
  GitFork,
  Download,
  Star,
  Calendar,
  ExternalLink,
  Zap,
  Code,
  Users,
  Award,
} from "lucide-react";
import { NavHeader } from "@/components/layout/nav-header";
import type { Feature } from "@/lib/data/types";

interface DeployedFeature {
  id: string;
  featureId: string;
  featureName: string;
  targetApp: string;
  status: "running" | "paused" | "error";
  deployedAt: string;
  activations: number;
}

export default function ProfilePage() {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [tab, setTab] = useState<"features" | "deployed" | "communities">("features");
  const [mounted, setMounted] = useState(false);
  const [userFeatures, setUserFeatures] = useState<Feature[]>([]);
  const [featuresLoading, setFeaturesLoading] = useState(true);
  const [deployments, setDeployments] = useState<DeployedFeature[]>([]);

  useEffect(() => setMounted(true), []);

  // Redirect if not logged in
  useEffect(() => {
    if (mounted && isLoaded && !isSignedIn) {
      router.push("/auth/sign-in");
    }
  }, [mounted, isLoaded, isSignedIn, router]);

  // Fetch user's created features
  useEffect(() => {
    if (!mounted || !clerkUser) return;
    const userId = clerkUser.id;

    fetch(`/api/features?authorId=${encodeURIComponent(userId)}&pageSize=50`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success !== false && json.data) {
          setUserFeatures(json.data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch user features:", err);
      })
      .finally(() => setFeaturesLoading(false));
  }, [mounted, clerkUser]);

  // Load deployments from localStorage
  useEffect(() => {
    if (!mounted) return;
    try {
      const stored = JSON.parse(localStorage.getItem("naya_deployments") || "[]");
      setDeployments(stored);
    } catch {
      setDeployments([]);
    }
  }, [mounted]);

  if (!mounted) return null;

  // Show loading while session is resolving
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black text-white">
        <NavHeader activePage="profile" />
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="w-8 h-8 border border-white/10 bg-white/5 animate-pulse mx-auto" />
          <p className="text-[10px] font-mono text-white/20 mt-4 tracking-[0.15em]">LOADING PROFILE...</p>
        </div>
      </div>
    );
  }

  if (!clerkUser) return null;

  const user = {
    id: clerkUser.id,
    name: clerkUser.fullName,
    email: clerkUser.primaryEmailAddress?.emailAddress ?? null,
    image: clerkUser.imageUrl,
    username: clerkUser.username ?? clerkUser.firstName?.toLowerCase() ?? "user",
  };

  const displayName = user.username ?? user.name ?? user.email?.split("@")[0] ?? "user";
  const joinDate = clerkUser.createdAt ? new Date(clerkUser.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "Member";

  const achievements = [
    { name: "FIRST DEPLOY", desc: "Deployed your first feature", earned: deployments.length > 0 },
    { name: "COMMUNITY STARTER", desc: "Created a community", earned: true },
    { name: "FORK MASTER", desc: "Feature forked 100+ times", earned: true },
    { name: "TRENDING", desc: "Feature hit trending page", earned: true },
    { name: "10K DEPLOYS", desc: "Total deployments exceeded 10K", earned: true },
    { name: "POLL WINNER", desc: "Feature won a community poll", earned: false },
  ];

  const totalDeployActivations = deployments.reduce((sum, d) => sum + (d.activations || 0), 0);

  return (
    <div className="min-h-screen bg-black text-white">
      <NavHeader activePage="profile" breadcrumbs={[{ label: "PROFILE" }]} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="space-y-4">
            <div className="border border-white/5 p-6 space-y-4">
              <div className="w-20 h-20 bg-white/5 border border-white/10 flex items-center justify-center mx-auto overflow-hidden">
                {user.image ? (
                  <img src={user.image} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <User size={32} className="text-white/20" />
                )}
              </div>
              <div className="text-center">
                <h2 className="text-sm font-mono font-bold">@{displayName}</h2>
                {user.name && user.name !== displayName && (
                  <p className="text-[10px] font-mono text-white/40 mt-0.5">{user.name}</p>
                )}
                {user.email && (
                  <p className="text-[10px] font-mono text-white/25 mt-0.5">{user.email}</p>
                )}
              </div>
              <div className="flex items-center justify-center gap-1 text-[10px] font-mono text-white/20">
                <Calendar size={10} /> {joinDate}
              </div>
            </div>

            {/* Stats */}
            <div className="border border-white/5 p-5 space-y-3">
              {[
                { label: "FEATURES", value: userFeatures.length.toString(), icon: Layers, color: "text-white/50" },
                { label: "DEPLOYMENTS", value: deployments.length.toString(), icon: Download, color: "text-white/50" },
                { label: "ACTIVATIONS", value: totalDeployActivations.toLocaleString(), icon: Zap, color: "text-red-500" },
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
                  {t.toUpperCase()}{" "}
                  {t === "features" && `(${userFeatures.length})`}
                  {t === "deployed" && `(${deployments.length})`}
                </button>
              ))}
            </div>

            {/* Features Grid */}
            {tab === "features" && (
              <>
                {featuresLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-white/[0.02]">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="bg-black border border-white/[0.03] p-4 space-y-3">
                        <div className="h-3 w-3/4 bg-white/5 animate-pulse" />
                        <div className="h-2 w-1/2 bg-white/[0.03] animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : userFeatures.length === 0 ? (
                  <div className="border border-white/5 p-8 text-center">
                    <Layers size={24} className="text-white/10 mx-auto mb-3" />
                    <p className="text-xs font-mono text-white/20">
                      NO FEATURES CREATED YET
                    </p>
                    <a href="/create" className="text-[11px] font-mono text-red-500 hover:text-red-400 mt-2 inline-block">
                      CREATE YOUR FIRST FEATURE →
                    </a>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-white/[0.02]">
                    {userFeatures.map((feature, i) => {
                      const statusColor = {
                        published: "text-green-500",
                        draft: "text-white/20",
                        archived: "text-white/20",
                      }[feature.status] || "text-white/20";

                      return (
                        <motion.a
                          key={feature.id}
                          href={`/feature/${feature.id}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="bg-black border border-white/[0.03] p-4 space-y-3 hover:border-white/10 transition-colors cursor-pointer block"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-[11px] font-mono font-bold tracking-wide">{feature.name.toUpperCase()}</h4>
                            <span className={`text-[8px] font-mono tracking-[0.1em] ${statusColor}`}>
                              ● {feature.status.toUpperCase()}
                            </span>
                          </div>
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
                        </motion.a>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {tab === "deployed" && (
              <>
                {deployments.length === 0 ? (
                  <div className="border border-white/5 p-8 text-center">
                    <Zap size={24} className="text-white/10 mx-auto mb-3" />
                    <p className="text-xs font-mono text-white/20">
                      NO FEATURES DEPLOYED YET
                    </p>
                    <a href="/explore" className="text-[11px] font-mono text-red-500 hover:text-red-400 mt-2 inline-block">
                      BROWSE FEATURES TO DEPLOY →
                    </a>
                  </div>
                ) : (
                  <div className="space-y-[1px] bg-white/[0.02]">
                    {deployments.map((dep, i) => (
                      <motion.div
                        key={dep.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-black border border-white/[0.03] p-4 flex items-center justify-between hover:border-white/10 transition-colors"
                      >
                        <div>
                          <a
                            href={`/feature/${dep.featureId}`}
                            className="text-[11px] font-mono font-bold tracking-wide hover:text-red-500 transition-colors"
                          >
                            {dep.featureName.toUpperCase()}
                          </a>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[9px] font-mono text-white/20">{dep.targetApp.toUpperCase()}</span>
                            <span className="text-[9px] font-mono text-white/15">{dep.activations || 0} activations</span>
                            <span className="text-[9px] font-mono text-white/15">
                              {new Date(dep.deployedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`text-[8px] font-mono tracking-[0.1em] flex items-center gap-1 ${
                            dep.status === "running"
                              ? "text-green-500"
                              : dep.status === "paused"
                              ? "text-yellow-500"
                              : "text-red-500"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 inline-block ${
                              dep.status === "running" ? "bg-green-500 animate-pulse" : dep.status === "paused" ? "bg-yellow-500" : "bg-red-500"
                            }`}
                          />
                          {dep.status.toUpperCase()}
                        </span>
                      </motion.div>
                    ))}
                    <div className="bg-black border border-white/[0.03] p-3 text-center">
                      <a href="/deploy" className="text-[11px] font-mono text-red-500 hover:text-red-400">
                        MANAGE DEPLOYMENTS →
                      </a>
                    </div>
                  </div>
                )}
              </>
            )}

            {tab === "communities" && (
              <div className="border border-white/5 p-8 text-center">
                <Users size={24} className="text-white/10 mx-auto mb-3" />
                <p className="text-xs font-mono text-white/20">
                  COMMUNITY MEMBERSHIPS
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
