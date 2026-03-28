"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  TrendingUp,
  GitFork,
  Download,
  Play,
  Code,
  Eye,
  Settings,
  Share2,
  Flag,
  Heart,
  MessageSquare,
  ExternalLink,
  Zap,
  Clock,
  User,
  Shield,
  Layers,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react";
import { api, ApiClientError } from "@/lib/api-client";
import type { Feature } from "@/lib/data/types";
import { NavHeader } from "@/components/layout/nav-header";

function FeatureDetailSkeleton() {
  return (
    <div className="min-h-screen bg-black text-white">
      <NavHeader activePage="feature" breadcrumbs={[{ label: "EXPLORE", href: "/explore" }, { label: "..." }]} />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <div className="h-3 w-32 bg-white/5 animate-pulse" />
          <div className="h-6 w-2/3 bg-white/5 animate-pulse" />
          <div className="space-y-2">
            <div className="h-2 w-full bg-white/[0.03] animate-pulse" />
            <div className="h-2 w-3/4 bg-white/[0.03] animate-pulse" />
          </div>
          <div className="h-10 w-full bg-white/[0.03] animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function FeatureDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [feature, setFeature] = useState<Feature | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "code" | "config" | "forks">("overview");
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [forking, setForking] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !params.id) return;

    const fetchFeature = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.features.get(params.id as string);
        setFeature(data);

        // Check if already deployed
        try {
          const deployments = JSON.parse(localStorage.getItem("naya_deployments") || "[]");
          const isDeployed = deployments.some(
            (d: { featureId: string; status: string }) =>
              d.featureId === params.id && d.status === "running"
          );
          setDeployed(isDeployed);
        } catch {
          // ignore
        }
      } catch (err) {
        if (err instanceof ApiClientError) {
          setError(err.message);
        } else {
          setError("Failed to load feature");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFeature();
  }, [mounted, params.id]);

  const handleDeploy = async () => {
    if (!feature) return;
    setDeploying(true);
    try {
      // Store deployment in localStorage
      const deployments = JSON.parse(localStorage.getItem("naya_deployments") || "[]");
      deployments.push({
        id: `deploy_${Date.now()}`,
        featureId: feature.id,
        featureName: feature.name,
        targetApp: feature.targetApp,
        status: "running",
        deployedAt: new Date().toISOString(),
        activations: 0,
      });
      localStorage.setItem("naya_deployments", JSON.stringify(deployments));
      setDeployed(true);
    } catch (err) {
      console.error("Deploy failed:", err);
    } finally {
      setDeploying(false);
    }
  };

  const handleFork = async () => {
    if (!feature) return;
    setForking(true);
    try {
      const forked = await api.features.fork(feature.id);
      router.push(`/feature/${forked.id}`);
    } catch (err) {
      console.error("Fork failed:", err);
    } finally {
      setForking(false);
    }
  };

  if (!mounted) return null;
  if (loading) return <FeatureDetailSkeleton />;

  if (error || !feature) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle size={32} className="text-red-500 mx-auto" />
          <p className="text-sm font-mono text-white/40">{error || "FEATURE NOT FOUND"}</p>
          <a
            href="/explore"
            className="text-[11px] font-mono text-red-500 hover:text-red-400 inline-flex items-center gap-1"
          >
            <ArrowLeft size={10} /> BACK TO EXPLORE
          </a>
        </div>
      </div>
    );
  }

  // Safely extract code — handle both object and string forms
  const featureCode =
    typeof feature.code === "object" && feature.code !== null
      ? feature.code
      : { html: "", css: "", js: "" };
  const codeHtml = featureCode.html || "";
  const codeCss = featureCode.css || "";
  const codeJs = featureCode.js || "";

  return (
    <div className="min-h-screen bg-black text-white">
      <NavHeader
        activePage="feature"
        breadcrumbs={[
          { label: "EXPLORE", href: "/explore" },
          { label: feature.name.toUpperCase() },
        ]}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Feature Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono tracking-[0.2em] text-white/30">
                  {feature.targetApp.toUpperCase()}
                </span>
                <span className="text-white/10">&middot;</span>
                <span className="text-[9px] font-mono tracking-[0.2em] text-white/20">
                  {feature.category.toUpperCase()}
                </span>
                <span className="text-white/10">&middot;</span>
                <span className={`text-[9px] font-mono tracking-[0.2em] ${
                  feature.status === "published" ? "text-green-500" : "text-white/30"
                }`}>
                  ● {feature.status.toUpperCase()}
                </span>
              </div>

              <h1 className="text-2xl font-mono font-bold tracking-wide">{feature.name.toUpperCase()}</h1>

              <p className="text-sm font-mono text-white/50 leading-relaxed">
                {feature.description}
              </p>

              <div className="flex items-center gap-3 flex-wrap">
                {feature.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] font-mono tracking-[0.1em] text-white/25 border border-white/5 px-2 py-1"
                  >
                    {tag.toUpperCase()}
                  </span>
                ))}
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-6 py-4 border-y border-white/5">
                <div className="flex items-center gap-1.5 text-sm font-mono">
                  <TrendingUp size={14} className="text-red-500" />
                  <span className="font-bold">{feature.upvotes.toLocaleString()}</span>
                  <span className="text-white/30 text-xs">votes</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-mono">
                  <GitFork size={14} className="text-white/40" />
                  <span className="font-bold">{feature.forkCount}</span>
                  <span className="text-white/30 text-xs">forks</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-mono">
                  <Download size={14} className="text-white/40" />
                  <span className="font-bold">{feature.deployCount.toLocaleString()}</span>
                  <span className="text-white/30 text-xs">deployed</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDeploy}
                disabled={deploying || deployed}
                className={`text-[11px] font-mono tracking-[0.15em] px-5 py-2.5 flex items-center gap-2 transition-colors disabled:opacity-70 ${
                  deployed
                    ? "bg-green-500 text-black"
                    : "bg-red-500 text-black hover:bg-red-400"
                }`}
              >
                {deploying ? (
                  <>
                    <Loader2 size={12} className="animate-spin" /> DEPLOYING...
                  </>
                ) : deployed ? (
                  <>
                    <Check size={12} /> DEPLOYED
                  </>
                ) : (
                  <>
                    <Play size={12} /> DEPLOY NOW
                  </>
                )}
              </button>
              <button
                onClick={handleFork}
                disabled={forking}
                className="text-[11px] font-mono tracking-[0.15em] border border-white/10 text-white/50 px-4 py-2.5 hover:text-white hover:border-white/20 transition-colors flex items-center gap-2 disabled:opacity-30"
              >
                {forking ? (
                  <>
                    <Loader2 size={12} className="animate-spin" /> FORKING...
                  </>
                ) : (
                  <>
                    <GitFork size={12} /> FORK
                  </>
                )}
              </button>
              <button className="text-[11px] font-mono tracking-[0.15em] border border-white/10 text-white/50 px-4 py-2.5 hover:text-white hover:border-white/20 transition-colors flex items-center gap-2">
                <Heart size={12} /> SAVE
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                }}
                className="text-[11px] font-mono tracking-[0.15em] border border-white/10 text-white/50 px-4 py-2.5 hover:text-white hover:border-white/20 transition-colors flex items-center gap-2"
              >
                <Share2 size={12} /> SHARE
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-0 border border-white/10">
              {(["overview", "code", "config", "forks"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`flex-1 text-[10px] font-mono tracking-[0.15em] py-2.5 transition-colors ${
                    activeTab === t ? "bg-white/5 text-white" : "text-white/30 hover:text-white/50"
                  }`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="border border-white/5 p-5">
                  <h3 className="text-xs font-mono font-bold tracking-[0.15em] mb-3">ABOUT</h3>
                  <p className="text-xs font-mono text-white/40 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Trigger Conditions */}
                {feature.triggerConditions.length > 0 && (
                  <div className="border border-white/5 p-5">
                    <h3 className="text-xs font-mono font-bold tracking-[0.15em] mb-3">TRIGGER CONDITIONS</h3>
                    <div className="space-y-2">
                      {feature.triggerConditions.map((tc, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="text-[10px] font-mono text-red-500 shrink-0 w-24">
                            {tc.type.toUpperCase()}
                          </span>
                          <span className="text-[10px] font-mono text-white/40">{tc.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Integration Hooks */}
                {feature.integrationHooks.length > 0 && (
                  <div className="border border-white/5 p-5">
                    <h3 className="text-xs font-mono font-bold tracking-[0.15em] mb-3">INTEGRATION HOOKS</h3>
                    <div className="space-y-2">
                      {feature.integrationHooks.map((hook, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="text-[10px] font-mono text-red-500 shrink-0 w-24">
                            {hook.type.toUpperCase()}
                          </span>
                          <span className="text-[10px] font-mono text-white/40">{hook.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "code" && (
              <div className="space-y-4">
                {/* HTML */}
                {codeHtml && (
                  <div className="border border-white/10 bg-black">
                    <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Code size={12} className="text-red-500" />
                        <span className="text-[10px] font-mono tracking-[0.15em] text-white/40">
                          HTML
                        </span>
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(codeHtml)}
                        className="text-[10px] font-mono text-white/30 hover:text-white transition-colors"
                      >
                        COPY
                      </button>
                    </div>
                    <pre className="p-4 overflow-x-auto max-h-[300px] overflow-y-auto">
                      <code className="text-xs font-mono text-white/50 leading-relaxed whitespace-pre-wrap">
                        {codeHtml}
                      </code>
                    </pre>
                  </div>
                )}

                {/* CSS */}
                {codeCss && (
                  <div className="border border-white/10 bg-black">
                    <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Code size={12} className="text-red-500" />
                        <span className="text-[10px] font-mono tracking-[0.15em] text-white/40">
                          CSS
                        </span>
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(codeCss)}
                        className="text-[10px] font-mono text-white/30 hover:text-white transition-colors"
                      >
                        COPY
                      </button>
                    </div>
                    <pre className="p-4 overflow-x-auto max-h-[300px] overflow-y-auto">
                      <code className="text-xs font-mono text-white/50 leading-relaxed whitespace-pre-wrap">
                        {codeCss}
                      </code>
                    </pre>
                  </div>
                )}

                {/* JavaScript */}
                {codeJs && (
                  <div className="border border-white/10 bg-black">
                    <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Code size={12} className="text-red-500" />
                        <span className="text-[10px] font-mono tracking-[0.15em] text-white/40">
                          JAVASCRIPT
                        </span>
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(codeJs)}
                        className="text-[10px] font-mono text-white/30 hover:text-white transition-colors"
                      >
                        COPY
                      </button>
                    </div>
                    <pre className="p-4 overflow-x-auto max-h-[300px] overflow-y-auto">
                      <code className="text-xs font-mono text-white/50 leading-relaxed whitespace-pre-wrap">
                        {codeJs}
                      </code>
                    </pre>
                  </div>
                )}

                {/* No code fallback */}
                {!codeHtml && !codeCss && !codeJs && (
                  <div className="border border-white/10 bg-black p-8 text-center">
                    <Code size={24} className="text-white/10 mx-auto mb-3" />
                    <p className="text-xs font-mono text-white/20">NO CODE AVAILABLE</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "config" && (
              <div className="border border-white/5 p-5 space-y-3">
                <h3 className="text-xs font-mono font-bold tracking-[0.15em] mb-3">CONFIGURATION</h3>
                <InfoRow label="NAME" value={feature.name} />
                <InfoRow label="TARGET APP" value={feature.targetApp} />
                <InfoRow label="CATEGORY" value={feature.category} />
                <InfoRow label="STATUS" value={feature.status} />
                <InfoRow label="PERMISSIONS" value={feature.permissions.join(", ")} />
                <InfoRow label="TAGS" value={feature.tags.join(", ")} />
                <InfoRow label="CREATED" value={new Date(feature.createdAt).toLocaleDateString()} />
                <InfoRow label="UPDATED" value={new Date(feature.updatedAt).toLocaleDateString()} />
              </div>
            )}

            {activeTab === "forks" && (
              <div className="border border-white/5 p-8 text-center">
                <GitFork size={24} className="text-white/10 mx-auto mb-3" />
                <p className="text-xs font-mono text-white/20">
                  {feature.forkCount} FORKS OF THIS FEATURE
                </p>
                <button
                  onClick={handleFork}
                  disabled={forking}
                  className="text-[11px] font-mono text-red-500 hover:text-red-400 mt-3 inline-flex items-center gap-1 disabled:opacity-30"
                >
                  {forking ? (
                    <Loader2 size={10} className="animate-spin" />
                  ) : (
                    <GitFork size={10} />
                  )}
                  CREATE YOUR FORK
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Creator Card */}
            <div className="border border-white/5 p-5 space-y-4">
              <h3 className="text-[10px] font-mono tracking-[0.2em] text-white/30">CREATOR</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center">
                  <User size={16} className="text-white/30" />
                </div>
                <div>
                  <p className="text-xs font-mono font-bold">@{feature.authorName}</p>
                  <p className="text-[9px] font-mono text-white/25">
                    {feature.authorId}
                  </p>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="border border-white/5 p-5 space-y-3">
              <h3 className="text-[10px] font-mono tracking-[0.2em] text-white/30">INFO</h3>
              <InfoRow label="CREATED" value={new Date(feature.createdAt).toLocaleDateString()} />
              <InfoRow label="UPDATED" value={new Date(feature.updatedAt).toLocaleDateString()} />
              <InfoRow label="TARGET" value={feature.targetApp} />
              <InfoRow label="CATEGORY" value={feature.category} />
              {feature.forkedFromId && (
                <div className="pt-2">
                  <a
                    href={`/feature/${feature.forkedFromId}`}
                    className="text-[10px] font-mono text-red-500 hover:text-red-400 flex items-center gap-1"
                  >
                    <GitFork size={10} /> FORKED FROM {feature.forkedFromId}
                  </a>
                </div>
              )}
            </div>

            {/* Permissions */}
            <div className="border border-white/5 p-5 space-y-3">
              <h3 className="text-[10px] font-mono tracking-[0.2em] text-white/30">PERMISSIONS</h3>
              {feature.permissions.map((perm) => (
                <div key={perm} className="flex items-center gap-2">
                  <Shield size={10} className="text-white/20" />
                  <span className="text-[10px] font-mono text-white/40">{perm}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-white/[0.03] last:border-0">
      <span className="text-[9px] font-mono tracking-[0.1em] text-white/20">{label}</span>
      <span className="text-[10px] font-mono text-white/50 text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}
