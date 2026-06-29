import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export const NEWSROOM = "https://www.anthropic.com/news";
export const ORIGIN = "https://www.anthropic.com";
export const DATA_DIR = "public/data";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0 Safari/537.36";

export async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status} ${res.statusText}`);
  return res.text();
}

export function absolute(href: string): string {
  if (href.startsWith("http")) return href;
  return ORIGIN + (href.startsWith("/") ? href : `/${href}`);
}

export function slugFromHref(href: string): string | null {
  const m = href.match(/^\/?news\/([a-z0-9][a-z0-9-]*)\/?$/i);
  return m ? m[1] : null;
}

/** Last path segment of a URL, e.g. ".../blog/my-post" → "my-post". */
export function lastSegment(url: string): string {
  try {
    const parts = new URL(url).pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] ?? "post";
  } catch {
    return "post";
  }
}

/** Make a string safe to use as a slug / filename. */
export function sanitize(s: string): string {
  return (
    s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) ||
    "post"
  );
}

export async function writeJson(path: string, value: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(value, null, 2) + "\n", "utf8");
}
