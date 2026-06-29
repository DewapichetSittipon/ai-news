// Build-time scraper / aggregator (ADR-0001, 0002, 0004).
// Pulls every configured source through its adapter, merges into one Snapshot
// of static JSON. Produces English content; scripts/translate.ts adds Thai.
// Run: npm run scrape

import { rm } from "node:fs/promises";
import { DATA_DIR, writeJson } from "./lib.ts";
import { SOURCES } from "./sources.ts";
import { fetchAnthropic } from "./adapters/anthropic.ts";
import { fetchRss } from "./adapters/rss.ts";
import type { NewsArticle, NewsMeta, SnapshotIndex } from "../src/types.ts";

async function main() {
  const all: NewsArticle[] = [];
  for (const cfg of SOURCES) {
    process.stdout.write(`Fetching ${cfg.id}... `);
    try {
      const articles =
        cfg.kind === "anthropic"
          ? await fetchAnthropic(cfg.url)
          : await fetchRss(cfg.id, cfg.feed);
      console.log(`${articles.length} items`);
      all.push(...articles);
    } catch (e) {
      console.warn(`\n  ✗ ${cfg.id}: ${String(e)}`);
    }
  }

  // Rewrite the articles directory from scratch so removed items don't linger.
  await rm(`${DATA_DIR}/articles`, { recursive: true, force: true });

  const seen = new Set<string>();
  const metas: NewsMeta[] = [];
  for (const a of all) {
    if (seen.has(a.id)) continue;
    seen.add(a.id);
    await writeJson(`${DATA_DIR}/articles/${a.id}.json`, a);
    const { body: _body, ...meta } = a;
    metas.push(meta);
  }

  metas.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const index: SnapshotIndex = { generatedAt: new Date().toISOString(), items: metas };
  await writeJson(`${DATA_DIR}/index.json`, index);
  console.log(`Wrote ${metas.length} items from ${SOURCES.length} sources`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
