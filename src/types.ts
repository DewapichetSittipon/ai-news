// Shared domain types — used by both the React app (src) and the build
// scripts (scripts/). See CONTEXT.md for the canonical glossary.

export type Locale = "en" | "th";

/** A value that exists in every Locale. */
export type Localized<T = string> = Record<Locale, T>;

/** The AI lab a News Item was published by. */
export type SourceId =
  | "anthropic"
  | "openai"
  | "deepmind"
  | "google-ai"
  | "huggingface";

/** Category as assigned by the source (e.g. "Product"). */
export type Category = string;

/** One renderable piece of a News Item body. */
export type NewsBlock =
  | { type: "p" | "h2" | "h3" | "li"; text: Localized }
  | { type: "img"; src: string; alt: string };

/** Everything needed to render a News Item in a list (no body). */
export interface NewsMeta {
  /** Stable composite id, `${source}__${slug}` — used for routing + filenames. */
  id: string;
  slug: string;
  source: SourceId;
  url: string;
  category: Category;
  /** ISO 8601 date string. */
  date: string;
  image: string | null;
  title: Localized;
  summary: Localized;
}

/** A full News Item, including its readable body. */
export interface NewsArticle extends NewsMeta {
  body: NewsBlock[];
}

/** The list Snapshot the app loads on boot. */
export interface SnapshotIndex {
  generatedAt: string;
  items: NewsMeta[];
}
