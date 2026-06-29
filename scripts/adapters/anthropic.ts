// Anthropic Newsroom adapter (ADR-0002). Anthropic has no feed, so we scrape.
// Category + publish date live only on the listing card; the article body is
// parsed from the article page via semantic selectors.

import * as cheerio from "cheerio";
import { absolute, fetchText, slugFromHref } from "../lib.ts";
import { htmlToBlocks, mono } from "./html.ts";
import type { NewsArticle } from "../../src/types.ts";

const MAX_ITEMS = Number(process.env.MAX_ITEMS ?? 40);
const DATE_RE = /([A-Z][a-z]{2,8}\s+\d{1,2},\s+\d{4})/;

interface ListingHint {
  slug: string;
  category: string;
  date: string;
}

function isoOr(fallback: string, raw?: string): string {
  const d = raw ? new Date(raw) : new Date(NaN);
  return Number.isNaN(d.getTime()) ? fallback : d.toISOString();
}

// Each card anchor's text is "Category + Date + Title + Summary" concatenated.
function discoverListing(listHtml: string): ListingHint[] {
  const $ = cheerio.load(listHtml);
  const hints: ListingHint[] = [];
  const seen = new Set<string>();
  $("a[href*='/news/']").each((_, a) => {
    const slug = slugFromHref($(a).attr("href") ?? "");
    if (!slug || seen.has(slug)) return;
    const text = $(a).text().replace(/\s+/g, " ").trim();
    const m = text.match(DATE_RE);
    const before = m ? text.slice(0, m.index) : "";
    const cm = before.match(/([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s*$/);
    hints.push({
      slug,
      category: cm ? cm[1] : "News",
      date: isoOr(new Date().toISOString(), m?.[1]),
    });
    seen.add(slug);
  });
  return hints.slice(0, MAX_ITEMS);
}

function parseArticle(slug: string, html: string, hint: ListingHint): NewsArticle {
  const $ = cheerio.load(html);
  const title =
    $("h1").first().text().trim() ||
    $("meta[property='og:title']").attr("content")?.trim() ||
    slug;
  const summary =
    $("meta[name='description']").attr("content")?.trim() ||
    $("article p").first().text().trim().slice(0, 200) ||
    title;

  return {
    id: `anthropic__${slug}`,
    slug,
    source: "anthropic",
    url: absolute(`/news/${slug}`),
    category: hint.category,
    date: hint.date,
    image: $("meta[property='og:image']").attr("content") ?? null,
    title: mono(title),
    summary: mono(summary),
    body: htmlToBlocks(html, { absolute, skipTitle: title }),
  };
}

export async function fetchAnthropic(url: string): Promise<NewsArticle[]> {
  const hints = discoverListing(await fetchText(url));
  const out: NewsArticle[] = [];
  for (const hint of hints) {
    try {
      out.push(parseArticle(hint.slug, await fetchText(absolute(`/news/${hint.slug}`)), hint));
    } catch (e) {
      console.warn(`  ✗ anthropic/${hint.slug}: ${String(e)}`);
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  return out;
}
