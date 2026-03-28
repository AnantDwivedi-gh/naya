/**
 * Input sanitisation and validation utilities.
 *
 * Every user-supplied string that touches storage, AI prompts, or HTML
 * rendering should pass through one of these functions first.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Default maximum length for generic text inputs. */
const DEFAULT_MAX_LENGTH = 5_000;

/** Maximum length for AI prompt inputs. */
const PROMPT_MAX_LENGTH = 10_000;

/** Pattern that matches HTML/XML tags including self-closing ones. */
const HTML_TAG_RE = /<\/?[^>]+(>|$)/g;

/**
 * Characters that are commonly used in prompt-injection attacks.
 * We do not strip them outright but use them for detection scoring.
 */
const PROMPT_INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?|rules?)/i,
  /disregard\s+(all\s+)?(previous|above|prior)/i,
  /you\s+are\s+now\s+/i,
  /system\s*:\s*/i,
  /\[\s*INST\s*\]/i,
  /<<\s*SYS\s*>>/i,
  /```\s*(system|instructions?)/i,
  /act\s+as\s+(if\s+)?(you\s+are\s+)?/i,
  /pretend\s+(you\s+are|to\s+be)\s+/i,
  /new\s+instructions?\s*:/i,
  /override\s+(your\s+)?(instructions?|rules?|prompt)/i,
];

/** Allowed ID format: alphanumeric, underscores, hyphens, 1-128 chars. */
const ID_RE = /^[a-zA-Z0-9_-]{1,128}$/;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Strip HTML tags, collapse whitespace, trim, and enforce a maximum length.
 *
 * Use this for any free-text input that will be stored or rendered.
 *
 * @param str  - Raw user input.
 * @param maxLength - Maximum allowed character count (default 5 000).
 * @returns Sanitised string.
 */
export function sanitizeInput(str: unknown, maxLength: number = DEFAULT_MAX_LENGTH): string {
  if (typeof str !== "string") return "";

  return str
    .replace(HTML_TAG_RE, "")   // strip HTML tags
    .replace(/&[#a-zA-Z0-9]+;/g, "") // strip HTML entities
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // strip control chars (keep \n, \r, \t)
    .trim()
    .slice(0, maxLength);
}

/**
 * Sanitise an AI prompt input.
 *
 * Performs the same basic sanitisation as `sanitizeInput`, then detects and
 * neutralises common prompt-injection patterns by wrapping the user content
 * in clear delimiters.
 *
 * @param str       - Raw user prompt.
 * @param maxLength - Maximum allowed character count (default 10 000).
 * @returns An object with the sanitised prompt and an injection risk flag.
 */
export function sanitizePrompt(
  str: unknown,
  maxLength: number = PROMPT_MAX_LENGTH,
): { text: string; injectionDetected: boolean } {
  const cleaned = sanitizeInput(str, maxLength);

  if (cleaned.length === 0) {
    return { text: "", injectionDetected: false };
  }

  // Score prompt-injection likelihood
  const injectionDetected = PROMPT_INJECTION_PATTERNS.some((re) => re.test(cleaned));

  // Wrap in explicit user-content delimiters so the model can distinguish
  // user input from system instructions.
  const text = `[USER_INPUT_START]\n${cleaned}\n[USER_INPUT_END]`;

  return { text, injectionDetected };
}

/**
 * Validate that a string matches the expected ID format.
 *
 * IDs should be 1-128 characters, containing only alphanumeric characters,
 * underscores, and hyphens.
 *
 * @param str - Candidate ID string.
 * @returns `true` if the string is a valid ID.
 */
export function validateId(str: unknown): boolean {
  if (typeof str !== "string") return false;
  return ID_RE.test(str);
}

/**
 * Generate a deterministic rate-limit key from a client IP address.
 *
 * Normalises IPv6-mapped IPv4 addresses and strips port numbers so that
 * the same physical client always maps to the same bucket.
 *
 * @param ip - Raw IP string (may include port, IPv6 prefix, etc.).
 * @returns A normalised key string prefixed with `rl:`.
 */
export function rateLimitKey(ip: string): string {
  let normalised = ip.trim();

  // Strip IPv6-mapped IPv4 prefix (::ffff:127.0.0.1 -> 127.0.0.1)
  if (normalised.startsWith("::ffff:")) {
    normalised = normalised.slice(7);
  }

  // Strip port from IPv4 (1.2.3.4:1234 -> 1.2.3.4)
  if (normalised.includes(".") && normalised.includes(":")) {
    normalised = normalised.split(":")[0];
  }

  // Strip bracket notation from IPv6 ([::1]:1234 -> ::1)
  normalised = normalised.replace(/^\[/, "").replace(/\]:?\d*$/, "");

  return `rl:${normalised}`;
}
