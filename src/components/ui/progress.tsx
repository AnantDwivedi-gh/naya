"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
  showLabel?: boolean;
}

const DOT_COUNT = 20;

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, showLabel = false, ...props }, ref) => {
    const clampedValue = Math.max(0, Math.min(100, value));
    const filledDots = Math.round((clampedValue / 100) * DOT_COUNT);

    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-2 font-mono", className)}
        {...props}
      >
        <div className="flex items-center gap-[2px]">
          {Array.from({ length: DOT_COUNT }).map((_, i) => (
            <motion.span
              key={i}
              initial={false}
              animate={{
                backgroundColor: i < filledDots ? "#ff0000" : "#222",
              }}
              transition={{ duration: 0.08, delay: i * 0.02 }}
              className="w-2 h-2 inline-block"
            />
          ))}
        </div>
        {showLabel && (
          <span className="text-[9px] text-[#666] uppercase tracking-wider w-8 text-right tabular-nums">
            {Math.round(clampedValue)}%
          </span>
        )}
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Progress };
