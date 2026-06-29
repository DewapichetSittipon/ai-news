import * as cheerio from "cheerio";
import type { Localized, NewsBlock } from "../../src/types.ts";

/** Until translation runs, both locales hold the English text. */
export function mono(en: string): Localized {
  return { en, th: en };
}

/**
 * Turn a chunk of article HTML into renderable blocks. `scopeSelector` picks the
 * container (default <article>, else the whole fragment); `skipTitle` drops a
 * heading equal to the article title so it isn't repeated in the body.
 */
export function htmlToBlocks(
  html: string,
  opts: { absolute?: (u: string) => string; skipTitle?: string; scope?: string } = {},
): NewsBlock[] {
  const { absolute = (u) => u, skipTitle } = opts;
  const $ = cheerio.load(html);
  const scoped = opts.scope ? $(opts.scope).first() : $("article").first();
  const root = scoped.length ? scoped : $.root();

  const blocks: NewsBlock[] = [];
  root.find("p, h2, h3, li, img").each((_, el) => {
    const tag = el.tagName.toLowerCase();
    if (tag === "img") {
      const src = $(el).attr("src");
      if (src) blocks.push({ type: "img", src: absolute(src), alt: $(el).attr("alt") ?? "" });
      return;
    }
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (text.length < 2 || text === skipTitle) return;
    blocks.push({
      type: tag === "h2" ? "h2" : tag === "h3" ? "h3" : tag === "li" ? "li" : "p",
      text: mono(text),
    });
  });
  return blocks;
}

/**
 * Extract article blocks from a *full page*, but only when a real content
 * container (<article>/<main>) exists — otherwise return [] so the caller can
 * fall back to the feed summary instead of scraping nav/footer junk.
 */
export function extractMainBlocks(
  html: string,
  absolute: (u: string) => string = (u) => u,
): NewsBlock[] {
  const $ = cheerio.load(html);
  const container = ["article", "main", "[role=main]"]
    .map((sel) => $(sel).first())
    .find((el) => el.length > 0);
  if (!container) return [];

  const skipTitle = $("h1").first().text().trim();
  const blocks: NewsBlock[] = [];
  container.find("p, h2, h3, li, img").each((_, el) => {
    const tag = el.tagName.toLowerCase();
    if (tag === "img") {
      const src = $(el).attr("src");
      if (src) blocks.push({ type: "img", src: absolute(src), alt: $(el).attr("alt") ?? "" });
      return;
    }
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (text.length < 2 || text === skipTitle) return;
    blocks.push({
      type: tag === "h2" ? "h2" : tag === "h3" ? "h3" : tag === "li" ? "li" : "p",
      text: mono(text),
    });
  });
  return blocks;
}

/** First <img> src found in an HTML fragment, made absolute. */
export function firstImage(
  html: string,
  absolute: (u: string) => string = (u) => u,
): string | null {
  const $ = cheerio.load(html);
  const src = $("img").first().attr("src");
  return src ? absolute(src) : null;
}
