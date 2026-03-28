"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

function Toggle({
  checked,
  onCheckedChange,
  disabled = false,
  label,
  className,
}: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "inline-flex items-center gap-2 group",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        "outline-none",
        className
      )}
    >
      <div
        className={cn(
          "relative w-8 h-4 border transition-colors duration-100",
          checked ? "border-[#ff0000] bg-[#111]" : "border-[#333] bg-black"
        )}
      >
        <motion.div
          initial={false}
          animate={{
            x: checked ? 15 : 1,
            backgroundColor: checked ? "#ff0000" : "#666",
          }}
          transition={{
            type: "tween",
            duration: 0.1,
            ease: "easeOut",
          }}
          className="absolute top-[2px] w-[12px] h-[12px]"
        />
      </div>
      {label && (
        <span
          className={cn(
            "font-mono text-[10px] uppercase tracking-[0.15em]",
            "transition-colors duration-100",
            checked ? "text-white" : "text-[#666]"
          )}
        >
          {label}
        </span>
      )}
    </button>
  );
}

export { Toggle };
