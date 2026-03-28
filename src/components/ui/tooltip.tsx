"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TooltipProps {
  content: string;
  side?: "top" | "bottom" | "left" | "right";
  children: React.ReactNode;
  className?: string;
}

function Tooltip({ content, side = "top", children, className }: TooltipProps) {
  const [open, setOpen] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>();

  const handleEnter = () => {
    timeoutRef.current = setTimeout(() => setOpen(true), 300);
  };

  const handleLeave = () => {
    clearTimeout(timeoutRef.current);
    setOpen(false);
  };

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-1.5",
    left: "right-full top-1/2 -translate-y-1/2 mr-1.5",
    right: "left-full top-1/2 -translate-y-1/2 ml-1.5",
  };

  const originMap = {
    top: { initial: { opacity: 0, y: 4 }, animate: { opacity: 1, y: 0 } },
    bottom: { initial: { opacity: 0, y: -4 }, animate: { opacity: 1, y: 0 } },
    left: { initial: { opacity: 0, x: 4 }, animate: { opacity: 1, x: 0 } },
    right: { initial: { opacity: 0, x: -4 }, animate: { opacity: 1, x: 0 } },
  };

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
    >
      {children}
      <AnimatePresence>
        {open && (
          <motion.span
            role="tooltip"
            initial={originMap[side].initial}
            animate={originMap[side].animate}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className={cn(
              "absolute z-50 pointer-events-none",
              "px-2 py-1 bg-white text-black",
              "font-mono text-[9px] uppercase tracking-[0.15em]",
              "whitespace-nowrap",
              positionClasses[side],
              className
            )}
          >
            {content}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

export { Tooltip };
