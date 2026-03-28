"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Users,
  User,
  Rocket,
  FolderOpen,
  Hash,
  ChevronDown,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SidebarSection {
  label: string;
  icon: React.ComponentType<any>;
  items: SidebarItem[];
  collapsible?: boolean;
}

export interface SidebarItem {
  id: string;
  label: string;
  count?: number;
  active?: boolean;
  href?: string;
}

export interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
  sections?: SidebarSection[];
  activeItemId?: string;
  onItemClick?: (id: string) => void;
  className?: string;
}

const defaultSections: SidebarSection[] = [
  {
    label: "Categories",
    icon: Layers,
    collapsible: true,
    items: [
      { id: "cat-ui", label: "UI/UX", count: 24 },
      { id: "cat-backend", label: "Backend", count: 18 },
      { id: "cat-mobile", label: "Mobile", count: 12 },
      { id: "cat-ai", label: "AI/ML", count: 31 },
      { id: "cat-infra", label: "Infrastructure", count: 9 },
    ],
  },
  {
    label: "Communities",
    icon: Users,
    collapsible: true,
    items: [
      { id: "com-oss", label: "Open Source" },
      { id: "com-startup", label: "Startups" },
      { id: "com-enterprise", label: "Enterprise" },
    ],
  },
  {
    label: "Your Features",
    icon: User,
    collapsible: true,
    items: [
      { id: "my-drafts", label: "Drafts", count: 3 },
      { id: "my-active", label: "Active", count: 7 },
      { id: "my-archived", label: "Archived", count: 15 },
    ],
  },
  {
    label: "Deployed",
    icon: Rocket,
    collapsible: true,
    items: [
      { id: "dep-prod", label: "Production", count: 42 },
      { id: "dep-staging", label: "Staging", count: 8 },
      { id: "dep-beta", label: "Beta", count: 5 },
    ],
  },
];

function Sidebar({
  open = true,
  onClose,
  sections = defaultSections,
  activeItemId,
  onItemClick,
  className,
}: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed top-12 left-0 bottom-0 z-40",
          "w-56 bg-black border-r border-[#222]",
          "flex flex-col font-mono",
          "transition-transform duration-200 ease-out",
          "lg:translate-x-0 lg:static",
          open ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        {/* Search */}
        <div className="px-3 py-3 border-b border-[#222]">
          <div className="flex items-center gap-2 h-7 px-2 border border-[#333] text-[#666]">
            <Search size={10} />
            <input
              placeholder="SEARCH"
              className="flex-1 bg-transparent text-[9px] uppercase tracking-[0.15em] outline-none placeholder:text-[#444] text-white font-mono"
            />
            <kbd className="text-[8px] text-[#444]">/</kbd>
          </div>
        </div>

        {/* Sections */}
        <div className="flex-1 overflow-y-auto py-1">
          {sections.map((section) => (
            <SidebarSectionGroup
              key={section.label}
              section={section}
              activeItemId={activeItemId}
              onItemClick={onItemClick}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="px-3 py-2 border-t border-[#222]">
          <div className="flex items-center gap-2 text-[9px] text-[#444] uppercase tracking-wider">
            <FolderOpen size={10} />
            <span>All Features</span>
            <span className="ml-auto tabular-nums">156</span>
          </div>
        </div>
      </aside>
    </>
  );
}

function SidebarSectionGroup({
  section,
  activeItemId,
  onItemClick,
}: {
  section: SidebarSection;
  activeItemId?: string;
  onItemClick?: (id: string) => void;
}) {
  const [collapsed, setCollapsed] = React.useState(false);
  const Icon = section.icon;

  return (
    <div className="py-1">
      <button
        onClick={() => section.collapsible && setCollapsed(!collapsed)}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-1.5",
          "text-[9px] uppercase tracking-[0.2em] text-[#666]",
          "hover:text-white transition-colors",
          !section.collapsible && "cursor-default"
        )}
      >
        <Icon size={10} />
        <span className="flex-1 text-left">{section.label}</span>
        {section.collapsible && (
          <ChevronDown
            size={10}
            className={cn(
              "transition-transform duration-100",
              collapsed && "-rotate-90"
            )}
          />
        )}
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            {section.items.map((item) => (
              <button
                key={item.id}
                onClick={() => onItemClick?.(item.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 pl-7 py-1",
                  "text-[10px] tracking-[0.1em]",
                  "transition-colors duration-75",
                  item.id === activeItemId
                    ? "text-white bg-[#111]"
                    : "text-[#666] hover:text-[#999] hover:bg-[#111]/50"
                )}
              >
                <Hash size={8} className="shrink-0 text-[#333]" />
                <span className="flex-1 text-left uppercase">{item.label}</span>
                {item.count !== undefined && (
                  <span className="text-[8px] text-[#444] tabular-nums">
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { Sidebar };
