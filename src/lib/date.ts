import type { Locale } from "../types";

const RECENT_DAYS = 7;

/** Format an ISO date for display, localised. Falls back to the raw string. */
export function formatDate(iso: string, locale: Locale): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(locale === "th" ? "th-TH" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

/** True when the item was published within the last RECENT_DAYS days. */
export function isRecent(iso: string): boolean {
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return false;
  return Date.now() - d < RECENT_DAYS * 24 * 60 * 60 * 1000;
}
