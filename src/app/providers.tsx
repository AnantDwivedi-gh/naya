"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convex) {
    // Render without Convex if URL not set (build time / demo mode)
    return <>{children}</>;
  }
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ConvexClientProvider>{children}</ConvexClientProvider>
    </SessionProvider>
  );
}
