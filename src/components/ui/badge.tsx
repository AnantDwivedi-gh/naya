"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const statusStyles = {
  active: "border-[#ff0000] text-[#ff0000]",
  draft: "border-[#666] text-[#666]",
  deployed: "border-white text-white",
  archived: "border-[#333] text-[#444]",
} as const;

const dotStyles = {
  active: "bg-[#ff0000]",
  draft: "bg-[#666]",
  deployed: "bg-white",
  archived: "bg-[#333]",
} as const;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: keyof typeof statusStyles;
  dot?: boolean;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, status = "draft", dot = true, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5",
          "h-5 px-2 border",
          "font-mono text-[9px] uppercase tracking-[0.2em]",
          "select-none",
          statusStyles[status],
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              "w-1 h-1 shrink-0",
              dotStyles[status],
              status === "active" && "animate-pulse"
            )}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export { Badge, statusStyles };
