"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

const sizeMap = {
  sm: "w-6 h-6 text-[9px]",
  md: "w-8 h-8 text-[10px]",
  lg: "w-10 h-10 text-xs",
} as const;

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: keyof typeof sizeMap;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = "md", ...props }, ref) => {
    const [imgError, setImgError] = React.useState(false);

    const showFallback = !src || imgError;

    const initials = fallback
      ? fallback
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : null;

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center",
          "bg-[#111] border border-[#333]",
          "overflow-hidden select-none shrink-0",
          "font-mono uppercase tracking-wider",
          sizeMap[size],
          className
        )}
        {...props}
      >
        {showFallback ? (
          initials ? (
            <span className="text-[#999]">{initials}</span>
          ) : (
            <User className="w-1/2 h-1/2 text-[#666]" />
          )
        ) : (
          <img
            src={src!}
            alt={alt || ""}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

export { Avatar };
