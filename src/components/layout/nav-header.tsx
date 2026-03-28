"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { UserMenu } from "@/components/auth/user-menu";

const NAV_LINKS = [
  { label: "EXPLORE", href: "/explore" },
  { label: "COMMUNITY", href: "/community" },
  { label: "CREATE", href: "/create" },
  { label: "DEPLOY", href: "/deploy" },
] as const;

type ActivePage = "explore" | "community" | "create" | "deploy" | "profile" | "feature" | (string & {});

interface NavHeaderProps {
  activePage?: ActivePage;
  /** Optional breadcrumb items shown after the logo. */
  breadcrumbs?: { label: string; href?: string }[];
}

export function NavHeader({ activePage, breadcrumbs }: NavHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-8">
          <a href="/" className="font-mono text-lg font-bold tracking-[0.3em]">
            NAYA<span className="text-red-500">.</span>
          </a>

          {/* Breadcrumbs (if any) */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="hidden md:flex items-center gap-2">
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-2">
                  <span className="text-white/20 font-mono text-sm">/</span>
                  {crumb.href ? (
                    <a
                      href={crumb.href}
                      className="text-[11px] font-mono tracking-[0.15em] text-white/40 hover:text-white/60 transition-colors"
                    >
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="text-[11px] font-mono tracking-[0.15em] text-white/60">
                      {crumb.label}
                    </span>
                  )}
                </span>
              ))}
            </div>
          )}

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`text-[11px] font-mono tracking-[0.15em] transition-colors ${
                  activePage === link.label.toLowerCase()
                    ? "text-white"
                    : "text-white/40 hover:text-white"
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Right: UserMenu + mobile toggle */}
        <div className="flex items-center gap-3">
          <UserMenu />

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden text-white/40 hover:text-white transition-colors"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 px-6 py-3 space-y-2">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`block text-[11px] font-mono tracking-[0.15em] py-1.5 transition-colors ${
                activePage === link.label.toLowerCase()
                  ? "text-white"
                  : "text-white/40 hover:text-white"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
