import type { SourceId } from "../src/types.ts";

// Build-time feed/scrape config per source. UI metadata (label, colour) lives
// separately in src/sources.ts. RSS is preferred — it's far less fragile than
// scraping (ADR-0004). Anthropic has no feed, so it keeps its bespoke scraper.
export type SourceConfig =
  | { id: SourceId; kind: "anthropic"; url: string }
  | { id: SourceId; kind: "rss"; feed: string };

export const SOURCES: SourceConfig[] = [
  { id: "anthropic", kind: "anthropic", url: "https://www.anthropic.com/news" },
  { id: "openai", kind: "rss", feed: "https://openai.com/news/rss.xml" },
  { id: "deepmind", kind: "rss", feed: "https://deepmind.google/blog/rss.xml" },
  { id: "google-ai", kind: "rss", feed: "https://blog.google/technology/ai/rss/" },
  { id: "huggingface", kind: "rss", feed: "https://huggingface.co/blog/feed.xml" },
];
