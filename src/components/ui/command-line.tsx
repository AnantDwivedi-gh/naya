"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Suggestion {
  label: string;
  description?: string;
}

export interface CommandLineProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  suggestions?: Suggestion[];
  processing?: boolean;
  processingText?: string;
  placeholder?: string;
  className?: string;
}

function CommandLine({
  value,
  onChange,
  onSubmit,
  suggestions = [],
  processing = false,
  processingText = "PROCESSING",
  placeholder = 'Describe a feature... e.g. "dark mode toggle for settings page"',
  className,
}: CommandLineProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [focused, setFocused] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);

  const filteredSuggestions = React.useMemo(() => {
    if (!value.trim() || processing) return [];
    return suggestions.filter((s) =>
      s.label.toLowerCase().includes(value.toLowerCase())
    );
  }, [value, suggestions, processing]);

  const showSuggestions = focused && filteredSuggestions.length > 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && filteredSuggestions[selectedIndex]) {
        onChange(filteredSuggestions[selectedIndex].label);
        setSelectedIndex(-1);
      } else if (value.trim()) {
        onSubmit(value);
      }
    } else if (e.key === "ArrowDown" && showSuggestions) {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp" && showSuggestions) {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      );
    } else if (e.key === "Escape") {
      setSelectedIndex(-1);
      inputRef.current?.blur();
    }
  };

  return (
    <div className={cn("relative w-full font-mono", className)}>
      <div
        className={cn(
          "flex items-center gap-3 bg-black border px-4 h-12",
          "transition-colors duration-100",
          focused ? "border-[#ff0000]" : "border-[#333]",
          processing && "border-[#ff0000]"
        )}
      >
        {processing ? (
          <Loader2 size={14} className="text-[#ff0000] animate-spin shrink-0" />
        ) : (
          <Zap size={14} className={cn("shrink-0", focused ? "text-[#ff0000]" : "text-[#666]")} />
        )}

        {processing ? (
          <div className="flex-1 flex items-center gap-2">
            <ProcessingAnimation text={processingText} />
          </div>
        ) : (
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setSelectedIndex(-1);
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setTimeout(() => setFocused(false), 150);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
              "flex-1 bg-transparent text-xs text-white",
              "outline-none placeholder:text-[#444]",
              "font-mono"
            )}
          />
        )}

        {!processing && value.trim() && (
          <button
            onClick={() => onSubmit(value)}
            className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-[#ff0000] hover:text-white transition-colors"
          >
            <span>Create</span>
            <ArrowRight size={12} />
          </button>
        )}
      </div>

      {/* Cursor blink indicator */}
      {focused && !processing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#ff0000]"
          style={{ animation: "naya-blink 1s steps(1) infinite" }}
        />
      )}

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.1 }}
            className="absolute top-full left-0 right-0 z-50 bg-black border border-[#333] border-t-0 max-h-48 overflow-y-auto"
          >
            {filteredSuggestions.map((suggestion, i) => (
              <button
                key={suggestion.label}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(suggestion.label);
                  setSelectedIndex(-1);
                  inputRef.current?.focus();
                }}
                className={cn(
                  "w-full text-left px-4 py-2 flex items-start gap-3",
                  "transition-colors duration-75",
                  i === selectedIndex
                    ? "bg-[#111] text-white"
                    : "text-[#999] hover:bg-[#111] hover:text-white"
                )}
              >
                <span className="text-[10px] text-[#ff0000] shrink-0 mt-0.5">
                  {">"}
                </span>
                <div>
                  <span className="text-[10px] uppercase tracking-[0.1em] block">
                    {suggestion.label}
                  </span>
                  {suggestion.description && (
                    <span className="text-[9px] text-[#666] block mt-0.5">
                      {suggestion.description}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes naya-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function ProcessingAnimation({ text }: { text: string }) {
  const [dots, setDots] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev + 1) % 4);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="text-xs text-[#ff0000] uppercase tracking-[0.15em]">
      {text}
      {".".repeat(dots)}
      <span className="invisible">{".".repeat(3 - dots)}</span>
    </span>
  );
}

export { CommandLine };
