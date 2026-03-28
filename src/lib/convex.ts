import { ConvexHttpClient } from "convex/browser";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL ?? "";

// Lazy-init: don't throw at import time (breaks Next.js build)
let _client: ConvexHttpClient | null = null;

export function getConvexClient(): ConvexHttpClient {
  if (!_client) {
    if (!CONVEX_URL) {
      throw new Error(
        "NEXT_PUBLIC_CONVEX_URL is not set. Add it to your .env.local file."
      );
    }
    _client = new ConvexHttpClient(CONVEX_URL);
  }
  return _client;
}

// Backwards-compat export — API routes already import `convex`
export const convex = CONVEX_URL ? new ConvexHttpClient(CONVEX_URL) : (null as any);
