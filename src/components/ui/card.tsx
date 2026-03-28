"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = true, children, ...props }, ref) => {
    if (hover) {
      return (
        <motion.div
          ref={ref}
          className={cn(
            "border border-[#222] bg-black",
            "font-mono text-white",
            "overflow-hidden",
            className
          )}
          whileHover={{
            borderColor: "rgba(255,255,255,0.3)",
            transition: { duration: 0.15 },
          }}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "border border-[#222] bg-black",
          "font-mono text-white",
          "overflow-hidden",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-4 py-3 border-b border-[#222]",
      "flex items-center justify-between",
      className
    )}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xs uppercase tracking-[0.2em] text-white font-mono font-medium",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardMeta = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("text-[10px] text-[#666] font-mono uppercase", className)}
    {...props}
  />
));
CardMeta.displayName = "CardMeta";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-4 py-3 text-xs text-[#999] font-mono", className)}
    {...props}
  />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-4 py-2 border-t border-[#222] flex items-center gap-3",
      "text-[10px] text-[#666] font-mono uppercase",
      className
    )}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardMeta, CardContent, CardFooter };
