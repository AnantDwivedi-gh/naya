"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";

export function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Loading state
  if (status === "loading") {
    return (
      <div className="w-8 h-8 bg-white/5 border border-white/10 animate-pulse" />
    );
  }

  // Signed out
  if (!session?.user) {
    return (
      <div className="flex items-center gap-4">
        <a
          href="/auth/signin"
          className="text-[11px] font-mono tracking-[0.15em] text-white/40 hover:text-white transition-colors"
        >
          SIGN IN
        </a>
        <a
          href="/auth/signin"
          className="text-[11px] font-mono tracking-[0.15em] bg-red-500 text-black px-4 py-2 hover:bg-red-400 transition-colors"
        >
          GET STARTED
        </a>
      </div>
    );
  }

  // Signed in
  const user = session.user as {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    username?: string;
  };

  const displayName = user.username ?? user.name ?? user.email?.split("@")[0] ?? "user";
  const initials = (user.name ?? displayName)
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 border border-white/10 bg-black px-2.5 py-1.5 hover:border-white/30 transition-colors duration-150"
      >
        {/* Avatar */}
        <div className="w-6 h-6 bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
          {user.image ? (
            <img
              src={user.image}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[9px] font-mono text-white/50">
              {initials}
            </span>
          )}
        </div>

        <span className="text-[10px] font-mono tracking-[0.1em] text-white/60 hidden sm:block max-w-[100px] truncate">
          @{displayName}
        </span>

        <ChevronDown
          size={10}
          className={`text-white/30 transition-transform duration-100 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 top-full mt-1 w-48 border border-white/10 bg-black z-50"
          >
            {/* User info */}
            <div className="px-3 py-2.5 border-b border-white/5">
              <p className="text-[10px] font-mono text-white/70 tracking-wide truncate">
                @{displayName}
              </p>
              {user.email && (
                <p className="text-[9px] font-mono text-white/25 mt-0.5 truncate">
                  {user.email}
                </p>
              )}
            </div>

            {/* Menu items */}
            <div className="py-1">
              <a
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-[10px] font-mono tracking-[0.1em] text-white/40 hover:text-white hover:bg-white/5 transition-colors"
              >
                <User size={12} />
                PROFILE
              </a>
              <a
                href="/profile?tab=settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-[10px] font-mono tracking-[0.1em] text-white/40 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Settings size={12} />
                SETTINGS
              </a>
            </div>

            {/* Sign out */}
            <div className="border-t border-white/5 py-1">
              <button
                onClick={() => {
                  setOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[10px] font-mono tracking-[0.1em] text-red-500/70 hover:text-red-500 hover:bg-red-500/5 transition-colors"
              >
                <LogOut size={12} />
                SIGN OUT
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
