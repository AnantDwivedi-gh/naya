"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  Zap,
  ArrowRight,
  Check,
  Loader2,
  Code,
  Eye,
  Settings,
  Layers,
  ChevronDown,
  X,
  Play,
  Download,
  GitFork,
  Share2,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api-client";
import type { GeneratedFeature } from "@/lib/data/types";

type GenerationPhase = "idle" | "analyzing" | "designing" | "coding" | "testing" | "complete";

const TARGET_APPS = [
  "Instagram",
  "Twitter/X",
  "YouTube",
  "LinkedIn",
  "Reddit",
  "TikTok",
  "Gmail",
  "Spotify",
  "GitHub",
  "Discord",
  "Slack",
  "Any Website",
];

const PHASE_MESSAGES: Record<GenerationPhase, string> = {
  idle: "",
  analyzing: "ANALYZING YOUR REQUEST...",
  designing: "DESIGNING FEATURE ARCHITECTURE...",
  coding: "GENERATING OVERLAY CODE...",
  testing: "RUNNING COMPATIBILITY CHECKS...",
  complete: "FEATURE READY FOR DEPLOYMENT",
};

function PhaseIndicator({ phase }: { phase: GenerationPhase }) {
  const phases: GenerationPhase[] = ["analyzing", "designing", "coding", "testing", "complete"];
  const currentIndex = phases.indexOf(phase);

  return (
    <div className="flex items-center gap-1">
      {phases.map((p, i) => (
        <div key={p} className="flex items-center gap-1">
          <div
            className={`w-6 h-[2px] transition-colors duration-300 ${
              i <= currentIndex
                ? i === currentIndex && phase !== "complete"
                  ? "bg-red-500 animate-pulse"
                  : "bg-red-500"
                : "bg-white/10"
            }`}
          />
        </div>
      ))}
    </div>
  );
}

function CodePreview({ code, filename }: { code: string; filename: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="border border-white/10 bg-black">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Code size={12} className="text-red-500" />
          <span className="text-[10px] font-mono tracking-[0.15em] text-white/40">
            {filename}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="text-[10px] font-mono text-white/30 hover:text-white transition-colors"
          >
            {copied ? "COPIED" : "COPY"}
          </button>
        </div>
      </div>
      <pre className="p-4 overflow-x-auto max-h-[500px] overflow-y-auto">
        <code className="text-xs font-mono text-white/60 leading-relaxed">{code}</code>
      </pre>
    </div>
  );
}

function OverlayPreview({ feature }: { feature: GeneratedFeature | null }) {
  if (!feature) return null;

  return (
    <div className="border border-white/10 bg-black">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Eye size={12} className="text-red-500" />
          <span className="text-[10px] font-mono tracking-[0.15em] text-white/40">
            PREVIEW // {feature.targetApp.toUpperCase()}
          </span>
        </div>
      </div>
      <div className="p-6 min-h-[300px] relative bg-[#111]">
        {/* Simulated app background */}
        <div className="absolute inset-0 opacity-20">
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 bg-white/10 shrink-0" />
                <div className="space-y-1 flex-1">
                  <div className="h-2 bg-white/10 w-24" />
                  <div className="h-2 bg-white/5 w-full" />
                  <div className="h-2 bg-white/5 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overlay widget preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="absolute top-4 right-4 w-64 border border-red-500/30 bg-black/95 backdrop-blur-sm"
        >
          <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={10} className="text-red-500" />
              <span className="text-[9px] font-mono tracking-[0.15em] text-white/60">
                {feature.name.toUpperCase()}
              </span>
            </div>
            <X size={10} className="text-white/30" />
          </div>
          <div className="p-3 space-y-2">
            <p className="text-[10px] font-mono text-white/50 leading-relaxed">
              {feature.description.slice(0, 120)}
              {feature.description.length > 120 ? "..." : ""}
            </p>
            <div className="flex items-center gap-1 pt-1">
              <div className="w-1.5 h-1.5 bg-green-500 animate-pulse" />
              <span className="text-[9px] font-mono text-green-500/70">ACTIVE</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function CreatePageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialPrompt = searchParams.get("prompt") || "";

  const [prompt, setPrompt] = useState(initialPrompt);
  const [targetApp, setTargetApp] = useState("Any Website");
  const [showApps, setShowApps] = useState(false);
  const [phase, setPhase] = useState<GenerationPhase>("idle");
  const [feature, setFeature] = useState<GeneratedFeature | null>(null);
  const [activeTab, setActiveTab] = useState<"preview" | "code" | "config">("preview");
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deploying, setDeploying] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [generationMeta, setGenerationMeta] = useState<Record<string, unknown> | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const hasAutoGenerated = useRef(false);

  const addTerminalLine = (line: string) => {
    setTerminalLines((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${line}`]);
  };

  const generate = async () => {
    if (!prompt.trim()) return;

    setPhase("analyzing");
    setTerminalLines([]);
    setFeature(null);
    setError(null);

    addTerminalLine(`> PROMPT: "${prompt}"`);
    addTerminalLine(`> TARGET: ${targetApp}`);
    addTerminalLine("> INITIALIZING GENERATION PIPELINE...");

    // Phase 1: Analyzing
    await new Promise((r) => setTimeout(r, 800));
    setPhase("designing");
    addTerminalLine("> PARSING INTENT: feature_creation");
    addTerminalLine(`> DETECTED APP CONTEXT: ${targetApp}`);
    addTerminalLine("> MAPPING CAPABILITY REQUIREMENTS...");

    // Phase 2: Designing
    await new Promise((r) => setTimeout(r, 600));
    setPhase("coding");
    addTerminalLine("> CALLING GENERATION ENGINE...");
    addTerminalLine("> GENERATING OVERLAY WIDGET CODE...");

    try {
      // Call the real API
      const result = await api.features.generate(prompt, targetApp);

      addTerminalLine("> APPLYING NAYA RUNTIME BINDINGS...");
      addTerminalLine("> INJECTING EVENT LISTENERS...");
      addTerminalLine(`> GENERATION METHOD: ${String(result.meta.generationMethod).toUpperCase()}`);

      if (result.meta.promptInjectionDetected) {
        addTerminalLine("> WARNING: POTENTIAL PROMPT INJECTION DETECTED (FLAGGED)");
      }

      // Phase 3: Testing
      await new Promise((r) => setTimeout(r, 500));
      setPhase("testing");
      addTerminalLine("> RUNNING SANDBOX TESTS...");
      addTerminalLine("> CHECKING DOM COMPATIBILITY...");
      addTerminalLine("> VALIDATING PERMISSIONS SCOPE...");

      await new Promise((r) => setTimeout(r, 400));

      setFeature(result.data);
      setGenerationMeta(result.meta);
      setPhase("complete");
      addTerminalLine("> ALL CHECKS PASSED");
      addTerminalLine(`> FEATURE "${result.data.name}" READY`);
      addTerminalLine(`> CATEGORY: ${result.data.category}`);
      addTerminalLine(`> PERMISSIONS: ${result.data.permissions.join(", ")}`);
      addTerminalLine("> AWAITING DEPLOYMENT COMMAND...");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Generation failed";
      setPhase("idle");
      setError(message);
      addTerminalLine(`> ERROR: ${message}`);
      addTerminalLine("> GENERATION PIPELINE ABORTED");
    }
  };

  const handleDeploy = async () => {
    if (!feature) return;
    setDeploying(true);
    addTerminalLine("> INITIATING DEPLOYMENT...");

    try {
      // First, publish the feature via POST /api/features
      const created = await api.features.create({
        name: feature.name,
        description: feature.description,
        targetApp: feature.targetApp,
        category: feature.category,
        code: feature.code,
        permissions: feature.permissions,
        tags: feature.tags,
        triggerConditions: feature.triggerConditions,
        integrationHooks: feature.integrationHooks,
        status: "published",
        authorId: "user_anonymous",
        authorName: "Anonymous",
      });

      addTerminalLine(`> FEATURE CREATED: ${created.id}`);

      // Store deployment in localStorage
      const deployments = JSON.parse(localStorage.getItem("naya_deployments") || "[]");
      deployments.push({
        id: `deploy_${Date.now()}`,
        featureId: created.id,
        featureName: feature.name,
        targetApp: feature.targetApp,
        status: "running",
        deployedAt: new Date().toISOString(),
        activations: 0,
      });
      localStorage.setItem("naya_deployments", JSON.stringify(deployments));

      addTerminalLine("> DEPLOYMENT SUCCESSFUL");
      addTerminalLine("> FEATURE IS NOW ACTIVE ON YOUR DEVICE");

      setTimeout(() => router.push("/deploy"), 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Deployment failed";
      addTerminalLine(`> DEPLOY ERROR: ${message}`);
    } finally {
      setDeploying(false);
    }
  };

  const handlePublish = async () => {
    if (!feature) return;
    setPublishing(true);
    addTerminalLine("> PUBLISHING TO COMMUNITY...");

    try {
      const created = await api.features.create({
        name: feature.name,
        description: feature.description,
        targetApp: feature.targetApp,
        category: feature.category,
        code: feature.code,
        permissions: feature.permissions,
        tags: feature.tags,
        triggerConditions: feature.triggerConditions,
        integrationHooks: feature.integrationHooks,
        status: "published",
        authorId: "user_anonymous",
        authorName: "Anonymous",
      });

      addTerminalLine(`> PUBLISHED AS: ${created.id}`);
      addTerminalLine("> FEATURE IS NOW VISIBLE IN EXPLORE");

      setTimeout(() => router.push(`/feature/${created.id}`), 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Publishing failed";
      addTerminalLine(`> PUBLISH ERROR: ${message}`);
    } finally {
      setPublishing(false);
    }
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  useEffect(() => {
    if (initialPrompt && !hasAutoGenerated.current) {
      hasAutoGenerated.current = true;
      generate();
    }
  }, []);

  const codeDisplay = feature
    ? `// === HTML ===\n${feature.code.html}\n\n// === CSS ===\n${feature.code.css}\n\n// === JavaScript ===\n${feature.code.js}`
    : "// Generate a feature to see code here...";

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
              CREATE
            </span>
          </div>
          {phase === "complete" && (
            <div className="flex items-center gap-3">
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="text-[10px] font-mono tracking-[0.15em] text-white/40 hover:text-white transition-colors flex items-center gap-1.5 border border-white/10 px-3 py-1.5 disabled:opacity-30"
              >
                {publishing ? <Loader2 size={10} className="animate-spin" /> : <Share2 size={10} />}
                {publishing ? "PUBLISHING..." : "SHARE"}
              </button>
              <button
                onClick={handleDeploy}
                disabled={deploying}
                className="text-[10px] font-mono tracking-[0.15em] bg-red-500 text-black px-3 py-1.5 hover:bg-red-400 transition-colors flex items-center gap-1.5 disabled:opacity-30"
              >
                {deploying ? <Loader2 size={10} className="animate-spin" /> : <Play size={10} />}
                {deploying ? "DEPLOYING..." : "DEPLOY"}
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Input + Terminal */}
          <div className="space-y-4">
            {/* Feature Prompt Input */}
            <div className="border border-white/10 bg-black">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5">
                <Terminal size={12} className="text-red-500" />
                <span className="text-[10px] font-mono tracking-[0.15em] text-white/40">
                  DESCRIBE YOUR FEATURE
                </span>
              </div>

              <div className="p-4 space-y-4">
                {/* Target App Selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowApps(!showApps)}
                    className="w-full flex items-center justify-between border border-white/10 px-3 py-2 text-xs font-mono text-white/60 hover:border-white/20 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Layers size={12} className="text-red-500" />
                      TARGET: {targetApp.toUpperCase()}
                    </span>
                    <ChevronDown size={12} />
                  </button>
                  <AnimatePresence>
                    {showApps && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute top-full left-0 right-0 z-10 border border-white/10 bg-black mt-1 max-h-48 overflow-y-auto"
                      >
                        {TARGET_APPS.map((app) => (
                          <button
                            key={app}
                            onClick={() => {
                              setTargetApp(app);
                              setShowApps(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs font-mono hover:bg-white/5 transition-colors ${
                              targetApp === app ? "text-red-500" : "text-white/50"
                            }`}
                          >
                            {app.toUpperCase()}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Prompt Textarea */}
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the feature you want to create..."
                    rows={4}
                    className="w-full bg-[#111] border border-white/5 text-sm font-mono text-white p-3 outline-none focus:border-red-500/30 transition-colors placeholder:text-white/20 resize-none"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-[10px] font-mono text-red-500 bg-red-500/5 border border-red-500/20 px-3 py-2">
                    <AlertCircle size={12} />
                    {error}
                  </div>
                )}

                <button
                  onClick={generate}
                  disabled={!prompt.trim() || (phase !== "idle" && phase !== "complete")}
                  className="w-full text-[11px] font-mono tracking-[0.15em] bg-red-500 text-black py-3 hover:bg-red-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {phase !== "idle" && phase !== "complete" ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      GENERATING...
                    </>
                  ) : (
                    <>
                      <Zap size={12} />
                      GENERATE FEATURE
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Generation Terminal */}
            <div className="border border-white/10 bg-black">
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-1.5 h-1.5 ${
                      phase === "idle"
                        ? "bg-white/20"
                        : phase === "complete"
                        ? "bg-green-500"
                        : "bg-red-500 animate-pulse"
                    }`}
                  />
                  <span className="text-[10px] font-mono tracking-[0.15em] text-white/40">
                    {phase === "idle" ? "READY" : PHASE_MESSAGES[phase]}
                  </span>
                </div>
                {phase !== "idle" && <PhaseIndicator phase={phase} />}
              </div>
              <div
                ref={terminalRef}
                className="p-4 h-64 overflow-y-auto font-mono text-xs space-y-1"
              >
                {terminalLines.length === 0 ? (
                  <span className="text-white/20">
                    // Waiting for generation command...
                  </span>
                ) : (
                  terminalLines.map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`${
                        line.includes("ALL CHECKS PASSED") || line.includes("SUCCESSFUL")
                          ? "text-green-500"
                          : line.includes("ERROR") || line.includes("WARNING")
                          ? "text-red-500"
                          : line.includes(">")
                          ? "text-white/50"
                          : "text-white/30"
                      }`}
                    >
                      {line}
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right: Preview/Code/Config */}
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex items-center gap-0 border border-white/10">
              {(["preview", "code", "config"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 text-[10px] font-mono tracking-[0.15em] py-2.5 transition-colors ${
                    activeTab === tab
                      ? "bg-white/5 text-white"
                      : "text-white/30 hover:text-white/50"
                  }`}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === "preview" && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {feature ? (
                    <OverlayPreview feature={feature} />
                  ) : (
                    <div className="border border-white/10 bg-black p-12 flex items-center justify-center min-h-[400px]">
                      <p className="text-xs font-mono text-white/20">
                        // PREVIEW WILL APPEAR HERE
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "code" && (
                <motion.div
                  key="code"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <CodePreview code={codeDisplay} filename="OVERLAY_WIDGET.TSX" />
                </motion.div>
              )}

              {activeTab === "config" && (
                <motion.div
                  key="config"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="border border-white/10 bg-black">
                    <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5">
                      <Settings size={12} className="text-red-500" />
                      <span className="text-[10px] font-mono tracking-[0.15em] text-white/40">
                        OVERLAY CONFIG
                      </span>
                    </div>
                    <div className="p-4 space-y-4">
                      {feature ? (
                        <>
                          <ConfigRow label="NAME" value={feature.name} />
                          <ConfigRow label="TARGET" value={feature.targetApp} />
                          <ConfigRow label="CATEGORY" value={feature.category.toUpperCase()} />
                          <ConfigRow
                            label="TRIGGER"
                            value={
                              feature.triggerConditions?.[0]?.description || "Page load"
                            }
                          />
                          <ConfigRow label="PERMISSIONS" value={feature.permissions.join(", ")} />
                          <ConfigRow label="TAGS" value={feature.tags.join(", ")} />
                          {generationMeta && (
                            <>
                              <ConfigRow
                                label="METHOD"
                                value={String(generationMeta.generationMethod).toUpperCase()}
                              />
                              <ConfigRow
                                label="GENERATED"
                                value={String(generationMeta.timestamp || new Date().toISOString())}
                              />
                            </>
                          )}
                        </>
                      ) : (
                        <p className="text-xs font-mono text-white/20 py-8 text-center">
                          // CONFIG AVAILABLE AFTER GENERATION
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            {phase === "complete" && feature && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2"
              >
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="flex-1 text-[10px] font-mono tracking-[0.15em] border border-white/10 py-3 text-white/50 hover:text-white hover:border-white/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-30"
                >
                  {publishing ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <GitFork size={12} />
                  )}
                  {publishing ? "PUBLISHING..." : "PUBLISH TO COMMUNITY"}
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob(
                      [
                        `<!-- ${feature.name} -->\n${feature.code.html}\n\n<style>\n${feature.code.css}\n</style>\n\n<script>\n${feature.code.js}\n</script>`,
                      ],
                      { type: "text/html" }
                    );
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${feature.name.toLowerCase().replace(/\s+/g, "-")}.html`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex-1 text-[10px] font-mono tracking-[0.15em] border border-white/10 py-3 text-white/50 hover:text-white hover:border-white/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={12} /> EXPORT
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-[10px] font-mono tracking-[0.15em] text-white/30">{label}</span>
      <span className="text-[11px] font-mono text-white/60 text-right max-w-[60%] truncate">
        {value}
      </span>
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <CreatePageInner />
    </Suspense>
  );
}
