import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { generateCspHeaderValue } from "@/lib/security/csp";

// ---------------------------------------------------------------------------
// Auth — protected / public / auth-only route definitions
// ---------------------------------------------------------------------------

/** Routes that require authentication — redirect to /auth/signin if not. */
function isProtectedRoute(pathname: string): boolean {
  const protectedPrefixes = ["/create", "/deploy", "/profile"];
  return protectedPrefixes.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

/** Auth pages that should redirect to / if user IS logged in. */
function isAuthPage(pathname: string): boolean {
  return pathname === "/auth/signin" || pathname === "/auth/signup";
}

// ---------------------------------------------------------------------------
// Rate limiting (in-memory, per-IP, sliding window)
// ---------------------------------------------------------------------------

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // per window

function getRateLimitInfo(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  let entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    rateLimitStore.set(ip, entry);
  }

  entry.count++;
  const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - entry.count);
  const allowed = entry.count <= RATE_LIMIT_MAX_REQUESTS;

  // Lazy cleanup: prune expired entries when store grows large
  if (rateLimitStore.size > 5000) {
    for (const [key, val] of rateLimitStore) {
      if (now > val.resetAt) rateLimitStore.delete(key);
    }
  }

  return { allowed, remaining, resetAt: entry.resetAt };
}

// ---------------------------------------------------------------------------
// CSP header (generated once at module load)
// ---------------------------------------------------------------------------

const cspHeaderValue = generateCspHeaderValue();

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Auth pages: redirect logged-in users away ----------------------------
  if (isAuthPage(pathname)) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // --- Auth gate (redirect unauthenticated users on protected routes) ------
  if (isProtectedRoute(pathname)) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  const response = NextResponse.next();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

  // --- CORS headers --------------------------------------------------------
  const origin = request.headers.get("origin") || "*";
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-user-id, x-user-name, x-device-id");
  response.headers.set("Access-Control-Max-Age", "86400");

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: response.headers,
    });
  }

  // --- Rate limiting -------------------------------------------------------
  const rateLimit = getRateLimitInfo(ip);
  response.headers.set("X-RateLimit-Limit", String(RATE_LIMIT_MAX_REQUESTS));
  response.headers.set("X-RateLimit-Remaining", String(rateLimit.remaining));
  response.headers.set("X-RateLimit-Reset", String(Math.ceil(rateLimit.resetAt / 1000)));

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests. Please try again later.",
        },
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
          "X-RateLimit-Limit": String(RATE_LIMIT_MAX_REQUESTS),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetAt / 1000)),
        },
      }
    );
  }

  // --- Auth header propagation --------------------------------------------
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    response.headers.set("X-Auth-Status", "authenticated");
  } else {
    response.headers.set("X-Auth-Status", "anonymous");
  }

  // --- Security headers ----------------------------------------------------

  // Content Security Policy
  response.headers.set("Content-Security-Policy", cspHeaderValue);

  // Prevent MIME-type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Prevent framing (clickjacking protection)
  response.headers.set("X-Frame-Options", "DENY");

  // Control referrer information
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Disable browser features we do not use
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );

  // Disable legacy XSS auditor — modern browsers use CSP instead
  response.headers.set("X-XSS-Protection", "0");

  // Enforce HTTPS (1 year, include subdomains, allow preload list)
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );

  return response;
}

export const config = {
  matcher: [
    // API routes (for CORS, rate limiting, security headers)
    "/api/:path*",
    // Protected routes
    "/create/:path*",
    "/deploy/:path*",
    "/profile/:path*",
    // Auth pages (for redirect-if-logged-in)
    "/auth/signin",
    "/auth/signup",
    // Community gets security headers but NOT auth protection
    "/community/:path*",
  ],
};
