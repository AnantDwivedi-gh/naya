"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false);
    const [lineCount, setLineCount] = React.useState(1);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const lines = e.target.value.split("\n").length;
      setLineCount(Math.max(lines, 1));
      props.onChange?.(e);
    };

    return (
      <div className="w-full font-mono">
        {label && (
          <label className="block text-[10px] uppercase tracking-[0.2em] text-[#666] mb-1">
            {label}
          </label>
        )}
        <div
          className={cn(
            "flex bg-black border",
            "transition-colors duration-100",
            focused ? "border-white" : "border-[#333]",
            error && "border-[#ff0000]"
          )}
        >
          <div className="py-2 pl-2 pr-0 select-none shrink-0 flex flex-col items-end">
            {Array.from({ length: Math.max(lineCount, 3) }).map((_, i) => (
              <span
                key={i}
                className="text-[9px] text-[#333] leading-[18px] w-5 text-right tabular-nums"
              >
                {i + 1}
              </span>
            ))}
          </div>
          <textarea
            ref={ref}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            onChange={handleChange}
            className={cn(
              "flex-1 min-h-[54px] py-2 px-2 bg-transparent",
              "text-xs text-white leading-[18px]",
              "outline-none resize-y",
              "placeholder:text-[#444]",
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

Textarea.displayName = "Textarea";

export { Textarea };
