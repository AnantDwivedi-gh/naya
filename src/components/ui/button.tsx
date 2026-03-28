"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-[#ff0000] text-white border border-[#ff0000] hover:bg-black hover:text-[#ff0000]",
  secondary:
    "bg-transparent text-white border border-white hover:bg-white hover:text-black",
  ghost:
    "bg-transparent text-[#999] border border-transparent hover:text-white hover:border-[#333]",
  destructive:
    "bg-black text-[#ff0000] border border-[#ff0000] hover:bg-[#ff0000] hover:text-white",
} as const;

const sizes = {
  sm: "h-7 px-3 text-[10px]",
  md: "h-9 px-5 text-xs",
  lg: "h-11 px-7 text-sm",
} as const;

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      children,
      disabled = false,
      loading = false,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97, transition: { duration: 0.05 } }}
        whileHover={{ y: -1, transition: { duration: 0.1 } }}
        className={cn(
          "inline-flex items-center justify-center gap-2",
          "font-mono uppercase tracking-[0.15em] font-medium",
          "transition-colors duration-100",
          "outline-none focus-visible:ring-1 focus-visible:ring-[#ff0000]",
          "disabled:opacity-40 disabled:pointer-events-none",
          "cursor-pointer select-none",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="inline-block w-3 h-3 border border-current border-t-transparent animate-spin" />
        )}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export { Button, variants as buttonVariants };
