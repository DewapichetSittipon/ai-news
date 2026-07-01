// Build-time EN→TH translation (ADR-0003, reverted to build-time).
// Fills the `th` side of every Localized field via the free, keyless Google
// Translate endpoint. Results are baked into the Snapshot and committed, so the
// browser never translates — Thai works everywhere, including mobile.
//
// A persisted disk cache (scripts/translation-cache.json) means a refresh only
// pays for genuinely new strings; unchanged articles are instant cache hits.

import { readFile, writeFile } from "node:fs/promises";
import type { NewsArticle } from "../src/types.ts";

const CACHE_PATH = "scripts/translation-cache.json";
const ENDPOINT = "https://translate.googleapis.com/translate_a/single";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0 Safari/537.36";
// The GET endpoint encodes the text in the URL; keep well under typical limits.
const MAX_CHARS = 1500;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

let cache: Record<string, string> = {};
let loaded = false;

async function loadCache(): Promise<void> {
  if (loaded) return;
  loaded = true;
  try {
    cache = JSON.parse(await readFile(CACHE_PATH, "utf8"));
  } catch {
    cache = {};
  }
}

async function saveCache(): Promise<void> {
  const sorted = Object.fromEntries(Object.entries(cache).sort());
  await writeFile(CACHE_PATH, JSON.stringify(sorted, null, 2) + "\n", "utf8");
}

/** Hit the unofficial gtx endpoint once, with a few retries/backoff. */
async function googleTranslate(text: string): Promise<string> {
  const url =
    `${ENDPOINT}?client=gtx&sl=en&tl=th&dt=t&q=${encodeURIComponent(text)}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { "user-agent": UA } });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = (await res.json()) as [Array<[string, ...unknown[]]>, ...unknown[]];
      const th = data[0].map((seg) => seg[0]).join("");
      return th || text;
    } catch (e) {
      if (attempt === 2) {
        console.warn(`\n  ✗ translate failed, keeping English: ${String(e)}`);
        return text; // graceful fallback — never break the whole run
      }
      await sleep(600 * (attempt + 1));
    }
  }
  return text;
}

/** Split overlong text on sentence boundaries so each request stays small. */
async function translateChunked(text: string): Promise<string> {
  const chunks: string[] = [];
  let buf = "";
  for (const sentence of text.split(/(?<=[.!?])\s+/)) {
    if (buf && (buf + " " + sentence).length > MAX_CHARS) {
      chunks.push(buf);
      buf = "";
    }
    buf = buf ? `${buf} ${sentence}` : sentence;
  }
  if (buf) chunks.push(buf);

  const out: string[] = [];
  for (const c of chunks) out.push(await googleTranslate(c));
  return out.join(" ");
}

/** Look up a translated string; falls back to English if it wasn't translated. */
function thOf(en: string): string {
  const key = en.trim();
  if (!key) return en;
  return cache[key] ?? en;
}

/** Every distinct English string in an article that needs a Thai rendering. */
function stringsOf(a: NewsArticle): string[] {
  const out = [a.title.en, a.summary.en];
  for (const block of a.body) if (block.type !== "img") out.push(block.text.en);
  return out;
}

/** Translate a batch of distinct strings with bounded concurrency. */
async function translateAll(keys: string[]): Promise<void> {
  let next = 0;
  let done = 0;
  let sinceFlush = 0;

  const worker = async () => {
    while (next < keys.length) {
      const key = keys[next++];
      const th = key.length <= MAX_CHARS ? await googleTranslate(key) : await translateChunked(key);
      cache[key] = th;
      done++;
      // Flush periodically so a long run survives interruption (Ctrl-C, CI timeout).
      if (++sinceFlush >= 25) {
        sinceFlush = 0;
        await saveCache();
      }
      process.stdout.write(`\r  translated ${done}/${keys.length} new strings`);
    }
  };

  const CONCURRENCY = 6;
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  if (keys.length) process.stdout.write("\n");
}

/** Populate the `th` field of every Localized value in the given articles. */
export async function translateArticles(articles: NewsArticle[]): Promise<void> {
  await loadCache();

  // Gather distinct, not-yet-cached strings across all articles (identical text
  // — shared boilerplate, repeated headings — is translated once).
  const pending = new Set<string>();
  for (const a of articles) {
    for (const en of stringsOf(a)) {
      const key = en.trim();
      if (key && cache[key] === undefined) pending.add(key);
    }
  }

  console.log(`  ${pending.size} new strings to translate (rest cached)`);
  await translateAll([...pending]);

  // Apply results back onto every article.
  for (const a of articles) {
    a.title.th = thOf(a.title.en);
    a.summary.th = thOf(a.summary.en);
    for (const block of a.body) {
      if (block.type !== "img") block.text.th = thOf(block.text.en);
    }
  }

  await saveCache();
}
