"use client";

import * as React from "react";
import { Wifi, Battery, Cpu, HardDrive, Signal } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DeviceStatus {
  api: "online" | "degraded" | "offline";
  latency?: number;
  version?: string;
}

export interface FooterProps {
  status?: DeviceStatus;
  className?: string;
}

function Footer({
  status = { api: "online", latency: 42, version: "0.1.0" },
  className,
}: FooterProps) {
  const statusColor = {
    online: "text-white",
    degraded: "text-[#ff0000]",
    offline: "text-[#444]",
  };

  const statusDot = {
    online: "bg-white",
    degraded: "bg-[#ff0000] animate-pulse",
    offline: "bg-[#444]",
  };

  return (
    <footer
      className={cn(
        "h-7 bg-black border-t border-[#222]",
        "flex items-center justify-between px-4",
        "font-mono text-[8px] uppercase tracking-[0.15em] text-[#444]",
        "select-none",
        className
      )}
    >
      {/* Left indicators */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className={cn("w-1 h-1", statusDot[status.api])} />
          <span className={statusColor[status.api]}>
            {status.api}
          </span>
        </div>

        {status.latency !== undefined && (
          <div className="flex items-center gap-1">
            <Signal size={8} />
            <span className="tabular-nums">{status.latency}ms</span>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Wifi size={8} />
          <span>Connected</span>
        </div>
      </div>

      {/* Center: version */}
      <div className="hidden sm:flex items-center gap-1">
        <span>NAYA</span>
        <span className="text-[#333]">//</span>
        <span>{status.version || "0.0.0"}</span>
      </div>

      {/* Right indicators */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Cpu size={8} />
          <span>Ready</span>
        </div>

        <div className="flex items-center gap-1">
          <HardDrive size={8} />
          <span className="tabular-nums">--</span>
        </div>

        <div className="flex items-center gap-1">
          <Battery size={8} />
          <span className="tabular-nums">100</span>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
