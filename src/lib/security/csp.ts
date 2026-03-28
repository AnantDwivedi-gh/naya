/**
 * Content Security Policy (CSP) configuration.
 *
 * Generates a strict CSP header string that allows only the resources
 * Naya actually needs (self, inline styles for Tailwind, Google Fonts,
 * Vercel Analytics) and blocks everything else.
 */

export interface CspDirectives {
  "default-src": string[];
  "script-src": string[];
  "style-src": string[];
  "img-src": string[];
  "font-src": string[];
  "connect-src": string[];
  "frame-src": string[];
  "object-src": string[];
  "base-uri": string[];
  "form-action": string[];
  "frame-ancestors": string[];
  "upgrade-insecure-requests"?: boolean;
}

/**
 * Default CSP directives for the Naya application.
 */
export const cspDirectives: CspDirectives = {
  "default-src": ["'self'"],
  "script-src": [
    "'self'",
    "https://va.vercel-scripts.com", // Vercel Analytics
  ],
  "style-src": [
    "'self'",
    "'unsafe-inline'", // Required for Tailwind CSS runtime styles
    "https://fonts.googleapis.com",
  ],
  "img-src": ["'self'", "data:", "blob:", "https:"],
  "font-src": [
    "'self'",
    "https://fonts.gstatic.com",
  ],
  "connect-src": [
    "'self'",
    "https://vitals.vercel-insights.com", // Vercel Speed Insights
    "https://va.vercel-scripts.com",      // Vercel Analytics
  ],
  "frame-src": ["'none'"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'none'"],
  "upgrade-insecure-requests": true,
};

/**
 * Serialise the directive map into a CSP header value string.
 *
 * @param directives - Optional override. Falls back to `cspDirectives`.
 * @returns A semicolon-separated CSP string suitable for the
 *          `Content-Security-Policy` response header.
 */
export function generateCspHeaderValue(
  directives: CspDirectives = cspDirectives,
): string {
  const parts: string[] = [];

  for (const [key, value] of Object.entries(directives)) {
    if (key === "upgrade-insecure-requests") {
      if (value === true) {
        parts.push("upgrade-insecure-requests");
      }
      continue;
    }

    if (Array.isArray(value) && value.length > 0) {
      parts.push(`${key} ${value.join(" ")}`);
    }
  }

  return parts.join("; ");
}
