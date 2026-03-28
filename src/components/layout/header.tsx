"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Menu, Bell, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";

export interface HeaderProps {
  onMenuClick?: () => void;
  onNotificationClick?: () => void;
  onCreateClick?: () => void;
  userName?: string;
  userAvatar?: string;
  notificationCount?: number;
  className?: string;
}

function Header({
  onMenuClick,
  onNotificationClick,
  onCreateClick,
  userName,
  userAvatar,
  notificationCount = 0,
  className,
}: HeaderProps) {
  return (
    <header
      className={cn(
        "h-12 bg-black border-b border-[#222]",
        "flex items-center justify-between px-4",
        "font-mono",
        className
      )}
    >
      {/* Left: menu + wordmark */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-1 text-[#666] hover:text-white transition-colors lg:hidden"
        >
          <Menu size={16} />
        </button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2"
        >
          <span className="text-sm font-bold tracking-[0.3em] text-white uppercase">
            NAYA
          </span>
          <span className="text-[9px] text-[#ff0000] uppercase tracking-wider hidden sm:inline-block">
            // BUILD
          </span>
        </motion.div>
      </div>

      {/* Center: nav links */}
      <nav className="hidden md:flex items-center gap-0">
        {["Features", "Community", "Deploy", "Docs"].map((link) => (
          <a
            key={link}
            href="#"
            className={cn(
              "px-3 py-1 text-[10px] uppercase tracking-[0.2em]",
              "text-[#666] hover:text-white transition-colors"
            )}
          >
            {link}
          </a>
        ))}
      </nav>

      {/* Right: actions + avatar */}
      <div className="flex items-center gap-2">
        <button
          onClick={onCreateClick}
          className={cn(
            "hidden sm:flex items-center gap-1.5 h-7 px-3",
            "border border-[#ff0000] text-[#ff0000]",
            "text-[9px] uppercase tracking-[0.15em]",
            "hover:bg-[#ff0000] hover:text-white transition-colors"
          )}
        >
          <Plus size={10} />
          <span>New</span>
        </button>

        <button
          onClick={onNotificationClick}
          className="relative p-1.5 text-[#666] hover:text-white transition-colors"
        >
          <Bell size={14} />
          {notificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#ff0000] text-white text-[7px] flex items-center justify-center font-mono">
              {notificationCount > 9 ? "+" : notificationCount}
            </span>
          )}
        </button>

        <Avatar
          src={userAvatar}
          fallback={userName}
          size="sm"
          className="cursor-pointer"
        />
      </div>
    </header>
  );
}

export { Header };
