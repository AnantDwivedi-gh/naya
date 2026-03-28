"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, width, height, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative bg-[#111] overflow-hidden",
          className
        )}
        style={{ width, height, ...style }}
        {...props}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent, transparent 2px, #1a1a1a 2px, #1a1a1a 4px)",
            animation: "naya-skeleton-scan 1.5s steps(20) infinite",
          }}
        />
        <style>{`
          @keyframes naya-skeleton-scan {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }
);

Skeleton.displayName = "Skeleton";

function SkeletonLine({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <Skeleton className={cn("h-3 w-full", className)} {...props} />;
}

function SkeletonBlock({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export { Skeleton, SkeletonLine, SkeletonBlock };
