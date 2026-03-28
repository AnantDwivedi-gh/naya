"use client";

import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DropdownItem {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface DropdownProps {
  items: DropdownItem[];
  value?: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  className?: string;
}

function Dropdown({
  items,
  value,
  onSelect,
  placeholder = "SELECT",
  className,
}: DropdownProps) {
  const [open, setOpen] = React.useState(false);
  const selected = items.find((item) => item.value === value);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          className={cn(
            "flex items-center justify-between gap-3",
            "w-full h-9 px-3 bg-black border border-[#333]",
            "font-mono text-xs uppercase tracking-[0.15em]",
            "hover:border-white transition-colors duration-100",
            "outline-none focus-visible:border-white",
            selected ? "text-white" : "text-[#666]",
            className
          )}
        >
          <span className="truncate">
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown
            size={12}
            className={cn(
              "shrink-0 transition-transform duration-100",
              open && "rotate-180"
            )}
          />
        </button>
      </Popover.Trigger>

      <AnimatePresence>
        {open && (
          <Popover.Content
            align="start"
            sideOffset={2}
            asChild
            forceMount
          >
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.1 }}
              className={cn(
                "z-50 w-[var(--radix-popover-trigger-width)]",
                "bg-black border border-[#333]",
                "font-mono max-h-60 overflow-y-auto"
              )}
            >
              {items.map((item) => (
                <button
                  key={item.value}
                  disabled={item.disabled}
                  onClick={() => {
                    onSelect(item.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2",
                    "text-[10px] uppercase tracking-[0.15em]",
                    "transition-colors duration-75",
                    "outline-none",
                    "disabled:text-[#333] disabled:cursor-not-allowed",
                    item.value === value
                      ? "text-[#ff0000] bg-[#111]"
                      : "text-[#999] hover:text-white hover:bg-[#111]"
                  )}
                >
                  <span className="mr-2 inline-block w-2">
                    {item.value === value ? ">" : " "}
                  </span>
                  {item.label}
                </button>
              ))}
            </motion.div>
          </Popover.Content>
        )}
      </AnimatePresence>
    </Popover.Root>
  );
}

export { Dropdown };
