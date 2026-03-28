"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Monitor,
  Smartphone,
  Cpu,
  HardDrive,
  Wifi,
  Check,
  X,
  Play,
  Pause,
  Trash2,
  Settings,
  RefreshCw,
  Layers,
  Eye,
  BarChart3,
  AlertCircle,
} from "lucide-react";

interface DeployedFeature {
  id: string;
  featureId: string;
  featureName: string;
  targetApp: string;
  status: "running" | "paused" | "error";
  deployedAt: string;
  activations: number;
}

interface DeviceCap {
  name: string;
  value: string;
  supported: boolean;
}

function StatusDot({ status }: { status: DeployedFeature["status"] }) {
  const colors = {
    running: "bg-green-500",
    paused: "bg-yellow-500",
    error: "bg-red-500",
  };

  return (
    <span
      className={`w-1.5 h-1.5 ${colors[status]} ${
        status === "running" ? "animate-pulse" : ""
      } inline-block`}
    />
  );
}

function detectDeviceCapabilities(): Record<string, DeviceCap> {
  if (typeof window === "undefined") return {};

  const ua = navigator.userAgent;

  // Detect browser
  let browser = "Unknown Browser";
  if (ua.includes("Chrome") && !ua.includes("Edg")) {
    const match = ua.match(/Chrome\/(\d+)/);
    browser = `Chrome ${match?.[1] || ""}`;
  } else if (ua.includes("Firefox")) {
    const match = ua.match(/Firefox\/(\d+)/);
    browser = `Firefox ${match?.[1] || ""}`;
  } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
    const match = ua.match(/Version\/(\d+)/);
    browser = `Safari ${match?.[1] || ""}`;
  } else if (ua.includes("Edg")) {
    const match = ua.match(/Edg\/(\d+)/);
    browser = `Edge ${match?.[1] || ""}`;
  }

  // Detect OS
  let os = "Unknown OS";
  if (ua.includes("Windows NT 10")) os = "Windows 10/11";
  else if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS X")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  // Screen
  const screenW = window.screen.width;
  const screenH = window.screen.height;
  const dpr = window.devicePixelRatio || 1;

  // Memory
  const nav = navigator as Navigator & { deviceMemory?: number };
  const memory = nav.deviceMemory
    ? `${nav.deviceMemory}GB`
    : "N/A";

  // Connection
  const conn = (navigator as Navigator & { connection?: { effectiveType?: string; downlink?: number } }).connection;
  const network = conn
    ? `${conn.effectiveType?.toUpperCase() || "Unknown"} — ${conn.downlink || "?"}Mbps`
    : "Connected";

  // Hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency || 0;

  return {
    browser: {
      name: "BROWSER",
      value: `${browser} + Extensions API`,
      supported: true,
    },
    os: {
      name: "OS",
      value: os,
      supported: true,
    },
    screen: {
      name: "DISPLAY",
      value: `${screenW}x${screenH} @${dpr}x`,
      supported: true,
    },
    cpu: {
      name: "CPU",
      value: cores > 0 ? `${cores} cores` : "Unknown",
      supported: cores >= 2,
    },
    memory: {
      name: "MEMORY",
      value: memory,
      supported: true,
    },
    network: {
      name: "NETWORK",
      value: network,
      supported: true,
    },
  };
}

export default function DeployPage() {
  const [mounted, setMounted] = useState(false);
  const [deployments, setDeployments] = useState<DeployedFeature[]>([]);
  const [deviceCaps, setDeviceCaps] = useState<Record<string, DeviceCap>>({});

  const loadDeployments = useCallback(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("naya_deployments") || "[]");
      setDeployments(stored);
    } catch {
      setDeployments([]);
    }
  }, []);

  const saveDeployments = useCallback((items: DeployedFeature[]) => {
    localStorage.setItem("naya_deployments", JSON.stringify(items));
    setDeployments(items);
  }, []);

  useEffect(() => {
    setMounted(true);
    loadDeployments();
    setDeviceCaps(detectDeviceCapabilities());
  }, [loadDeployments]);

  const toggleStatus = (id: string) => {
    const updated = deployments.map((d) => {
      if (d.id !== id) return d;
      return {
        ...d,
        status: d.status === "running" ? ("paused" as const) : ("running" as const),
      };
    });
    saveDeployments(updated);
  };

  const removeDeployment = (id: string) => {
    const updated = deployments.filter((d) => d.id !== id);
    saveDeployments(updated);
  };

  const rescanDevice = () => {
    setDeviceCaps(detectDeviceCapabilities());
  };

  if (!mounted) return null;

  const running = deployments.filter((f) => f.status === "running").length;
  const totalActivations = deployments.reduce((sum, f) => sum + (f.activations || 0), 0);

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
            <span className="text-[11px] font-mono tracking-[0.15em] text-white/40">DEPLOY</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-green-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 animate-pulse inline-block" />
              {running} RUNNING
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Device Capability Panel */}
        <div className="border border-white/5">
          <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu size={12} className="text-red-500" />
              <span className="text-[10px] font-mono tracking-[0.2em] text-white/40">
                DEVICE CAPABILITIES
              </span>
            </div>
            <button
              onClick={rescanDevice}
              className="text-[9px] font-mono text-white/20 hover:text-white/40 flex items-center gap-1"
            >
              <RefreshCw size={9} /> RESCAN
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-[1px] bg-white/[0.02]">
            {Object.values(deviceCaps).map((cap) => (
              <div key={cap.name} className="bg-black p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono tracking-[0.15em] text-white/25">
                    {cap.name}
                  </span>
                  {cap.supported ? (
                    <Check size={10} className="text-green-500" />
                  ) : (
                    <X size={10} className="text-red-500" />
                  )}
                </div>
                <p className="text-[10px] font-mono text-white/50">{cap.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Runtime Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "ACTIVE OVERLAYS",
              value: running.toString(),
              icon: Layers,
              color: "text-green-500",
            },
            {
              label: "TOTAL DEPLOYMENTS",
              value: deployments.length.toString(),
              icon: Zap,
              color: "text-red-500",
            },
            {
              label: "ACTIVATIONS",
              value: totalActivations.toLocaleString(),
              icon: BarChart3,
              color: "text-white/50",
            },
            {
              label: "UPTIME",
              value: running > 0 ? "99.7%" : "N/A",
              icon: Monitor,
              color: "text-white/50",
            },
          ].map((stat) => (
            <div key={stat.label} className="border border-white/5 p-4 space-y-1">
              <div className="flex items-center gap-1.5">
                <stat.icon size={10} className={stat.color} />
                <span className="text-[9px] font-mono tracking-[0.15em] text-white/25">
                  {stat.label}
                </span>
              </div>
              <p className="text-lg font-mono font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Deployed Features List */}
        <div className="border border-white/5">
          <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={12} className="text-red-500" />
              <span className="text-[10px] font-mono tracking-[0.2em] text-white/40">
                DEPLOYED FEATURES
              </span>
            </div>
          </div>

          {deployments.length === 0 ? (
            <div className="p-12 text-center">
              <Layers size={24} className="text-white/10 mx-auto mb-3" />
              <p className="text-xs font-mono text-white/20 mb-3">
                NO FEATURES DEPLOYED
              </p>
              <a
                href="/explore"
                className="text-[11px] font-mono text-red-500 hover:text-red-400 inline-block"
              >
                BROWSE FEATURES TO DEPLOY
              </a>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.03]">
              {deployments.map((feature, i) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.08 }}
                  className="px-5 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <StatusDot status={feature.status} />
                    <div>
                      <a
                        href={`/feature/${feature.featureId}`}
                        className="text-xs font-mono font-bold tracking-wide hover:text-red-500 transition-colors"
                      >
                        {feature.featureName.toUpperCase()}
                      </a>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[9px] font-mono text-white/20">
                          {feature.targetApp.toUpperCase()}
                        </span>
                        <span className="text-[9px] font-mono text-white/15">
                          {feature.activations || 0} activations
                        </span>
                        <span className="text-[9px] font-mono text-white/15">
                          {new Date(feature.deployedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        (window.location.href = `/feature/${feature.featureId}`)
                      }
                      className="p-1.5 text-white/20 hover:text-white/50 transition-colors"
                      title="View"
                    >
                      <Eye size={13} />
                    </button>
                    <button
                      onClick={() => toggleStatus(feature.id)}
                      className="p-1.5 text-white/20 hover:text-white/50 transition-colors"
                      title={feature.status === "running" ? "Pause" : "Resume"}
                    >
                      {feature.status === "running" ? (
                        <Pause size={13} />
                      ) : (
                        <Play size={13} />
                      )}
                    </button>
                    <button
                      onClick={() => removeDeployment(feature.id)}
                      className="p-1.5 text-white/20 hover:text-red-500 transition-colors"
                      title="Remove"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Overlay Runtime Status */}
        <div className="border border-white/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Monitor size={12} className="text-red-500" />
              <span className="text-[10px] font-mono tracking-[0.2em] text-white/40">
                OVERLAY RUNTIME
              </span>
            </div>
            <span className="text-[9px] font-mono text-green-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 inline-block" /> CONNECTED
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[10px] font-mono text-white/30">
            <div className="space-y-1">
              <p className="text-white/15">RUNTIME VERSION</p>
              <p className="text-white/50">naya-runtime v1.4.2</p>
            </div>
            <div className="space-y-1">
              <p className="text-white/15">EXTENSION STATUS</p>
              <p className="text-white/50">
                {deviceCaps.browser?.value?.includes("Chrome")
                  ? "Chrome Extension Active"
                  : "Browser Extension Available"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-white/15">INJECTION MODE</p>
              <p className="text-white/50">Shadow DOM Isolation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
