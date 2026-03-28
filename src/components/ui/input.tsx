"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefix?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, prefix = ">", type = "text", ...props }, ref) => {
    const [focused, setFocused] = React.useState(false);

    return (
      <div className="w-full font-mono">
        {label && (
          <label className="block text-[10px] uppercase tracking-[0.2em] text-[#666] mb-1">
            {label}
          </label>
        )}
        <div
          className={cn(
            "flex items-center gap-2 bg-black border px-3 h-9",
            "transition-colors duration-100",
            focused ? "border-white" : "border-[#333]",
            error && "border-[#ff0000]"
          )}
        >
          <span
            className={cn(
              "text-xs select-none shrink-0",
              focused ? "text-[#ff0000]" : "text-[#666]"
            )}
          >
            {prefix}
          </span>
          {focused && (
            <span className="w-[1px] h-4 bg-white animate-pulse shrink-0" />
          )}
          <input
            ref={ref}
            type={type}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            className={cn(
              "flex-1 bg-transparent text-xs text-white",
              "outline-none placeholder:text-[#444]",
              "font-mono",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-[10px] text-[#ff0000] uppercase tracking-wider">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
