// Generic RSS/Atom adapter (ADR-0004). Handles both <item> (RSS) and <entry>
// (Atom) feeds, pulling full content where the feed provides it.

import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";
import { fetchText, lastSegment, sanitize } from "../lib.ts";
import { extractMainBlocks, firstImage, htmlToBlocks, mono } from "./html.ts";
import type { NewsArticle, NewsBlock, SourceId } from "../../src/types.ts";

const MAX_ITEMS = Number(process.env.MAX_ITEMS ?? 40);
const MIN_FULL_BLOCKS = 3; // below this, the page scrape isn't worth the summary

export async function fetchRss(
  source: SourceId,
  feedUrl: string,
): Promise<NewsArticle[]> {
  const xml = await fetchText(feedUrl);
  const $ = cheerio.load(xml, { xmlMode: true });

  // In xmlMode tag names keep their original case (incl. namespaces).
  const text = (el: AnyNode, name: string) =>
    $(el).find("*").filter((_, n) => "name" in n && n.name === name).first().text().trim();
  const attr = (el: AnyNode, name: string, a: string) =>
    $(el).find("*").filter((_, n) => "name" in n && n.name === name).first().attr(a);

  const entries = $("item").length ? $("item") : $("entry");
  const out: NewsArticle[] = [];

  entries.slice(0, MAX_ITEMS).each((_, el) => {
    const title = text(el, "title");
    const url =
      text(el, "link") || attr(el, "link", "href") || ""; // RSS text vs Atom href
    if (!title || !url) return;

    const rawDate =
      text(el, "pubDate") || text(el, "published") || text(el, "updated");
    const date = rawDate && !Number.isNaN(new Date(rawDate).getTime())
      ? new Date(rawDate).toISOString()
      : new Date().toISOString();

    // Prefer full content; fall back to the summary/description.
    const content = text(el, "content:encoded") || text(el, "content");
    const description = text(el, "description") || text(el, "summary");
    const bodyHtml = content || description;

    const image =
      attr(el, "media:content", "url") ||
      attr(el, "enclosure", "url") ||
      (bodyHtml ? firstImage(bodyHtml) : null);

    const category = text(el, "category") || "News";
    const slug = sanitize(lastSegment(url));

    // Some feeds give rich HTML; others only a short plain-text blurb. If block
    // parsing finds nothing, fall back to the description as a single paragraph.
    let body = bodyHtml ? htmlToBlocks(bodyHtml) : [];
    if (body.length === 0) {
      const plain = (description || title).replace(/\s+/g, " ").trim();
      body = [{ type: "p", text: mono(plain) }];
    }

    out.push({
      id: `${source}__${slug}`,
      slug,
      source,
      url,
      category,
      date,
      image: image ?? null,
      title: mono(title),
      summary: mono((description || title).replace(/\s+/g, " ").slice(0, 220)),
      body,
    });
  });

  // Phase 2: when the feed only carried a short body, try to scrape the full
  // article page. Server-rendered sites (DeepMind, Google, HF) yield full text;
  // SPAs (OpenAI) yield nothing and keep the feed summary.
  for (const item of out) {
    if (item.body.length >= MIN_FULL_BLOCKS) continue;
    try {
      const full: NewsBlock[] = extractMainBlocks(await fetchText(item.url));
      if (full.length >= MIN_FULL_BLOCKS) item.body = full;
    } catch {
      /* keep the feed summary */
    }
    await new Promise((r) => setTimeout(r, 200));
  }

  return out;
}
