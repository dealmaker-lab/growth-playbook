/**
 * Simple in-memory rate limiter.
 * Uses a Map keyed by `{scope}:{ip}` with a sliding window.
 * Resets on serverless cold start — acceptable for basic abuse protection.
 *
 * Each scope gets an independent window so endpoints don't share budgets.
 */

interface RateLimitEntry {
  timestamps: number[];
}

interface RateLimitOptions {
  /** Independent namespace per endpoint (e.g. "unlock", "analytics", "admin-auth"). Default "default". */
  scope?: string;
  /** Max requests allowed inside the window. Default 5. */
  max?: number;
  /** Window size in ms. Default 15 min. */
  windowMs?: number;
}

const DEFAULT_MAX = 5;
const DEFAULT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const store = new Map<string, RateLimitEntry>();

// Periodically clean up stale entries to prevent memory leaks
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
let lastCleanup = Date.now();

function cleanup(maxWindow: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, entry] of store) {
    const valid = entry.timestamps.filter((t) => now - t < maxWindow);
    if (valid.length === 0) {
      store.delete(key);
    } else {
      entry.timestamps = valid;
    }
  }
}

export function rateLimit(
  ip: string,
  opts: RateLimitOptions = {}
): { success: boolean; remaining: number } {
  const scope = opts.scope ?? 'default';
  const max = opts.max ?? DEFAULT_MAX;
  const windowMs = opts.windowMs ?? DEFAULT_WINDOW_MS;

  cleanup(windowMs);

  const key = `${scope}:${ip}`;
  const now = Date.now();
  const entry = store.get(key) ?? { timestamps: [] };

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= max) {
    return { success: false, remaining: 0 };
  }

  entry.timestamps.push(now);
  store.set(key, entry);

  return { success: true, remaining: max - entry.timestamps.length };
}
