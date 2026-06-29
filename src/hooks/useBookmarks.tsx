import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "claude-news:bookmarks";

interface BookmarksContextValue {
  /** Slugs the visitor has bookmarked, newest first. */
  slugs: string[];
  has: (slug: string) => boolean;
  toggle: (slug: string) => void;
}

const BookmarksContext = createContext<BookmarksContextValue | null>(null);

function readInitial(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

export function BookmarksProvider({ children }: { children: ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>(readInitial);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  }, [slugs]);

  const toggle = useCallback((slug: string) => {
    setSlugs((current) =>
      current.includes(slug)
        ? current.filter((s) => s !== slug)
        : [slug, ...current],
    );
  }, []);

  const value = useMemo<BookmarksContextValue>(
    () => ({ slugs, has: (slug) => slugs.includes(slug), toggle }),
    [slugs, toggle],
  );

  return <BookmarksContext value={value}>{children}</BookmarksContext>;
}

export function useBookmarks(): BookmarksContextValue {
  const ctx = useContext(BookmarksContext);
  if (!ctx) throw new Error("useBookmarks must be used within <BookmarksProvider>");
  return ctx;
}
