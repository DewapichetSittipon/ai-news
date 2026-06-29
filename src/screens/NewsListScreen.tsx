import { useMemo, useState } from "react";
import { TopBar } from "../components/TopBar";
import { CategoryTabs } from "../components/CategoryTabs";
import { SearchBar } from "../components/SearchBar";
import { NewsRow } from "../components/NewsRow";
import { NesButton } from "../components/NesButton";
import { useSnapshotIndex } from "../hooks/useSnapshot";
import { useLocale } from "../hooks/useLocale";
import { formatDate } from "../lib/date";
import { SOURCE_LIST } from "../sources";
import type { SourceId } from "../types";

export function NewsListScreen() {
  const snapshot = useSnapshotIndex();
  const { t, locale } = useLocale();
  const [category, setCategory] = useState<string | null>(null);
  const [source, setSource] = useState<SourceId | null>(null);
  const [query, setQuery] = useState("");
  const [newestFirst, setNewestFirst] = useState(true);

  const items = snapshot.status === "ready" ? snapshot.data.items : [];

  const categories = useMemo(
    () => [...new Set(items.map((i) => i.category))].sort(),
    [items],
  );

  // Only show source chips for labs actually present in the Snapshot.
  const presentSources = useMemo(() => {
    const ids = new Set(items.map((i) => i.source));
    return SOURCE_LIST.filter((s) => ids.has(s.id));
  }, [items]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((i) => (source ? i.source === source : true))
      .filter((i) => (category ? i.category === category : true))
      .filter((i) =>
        q
          ? (i.title.en + i.title.th + i.summary.en + i.summary.th)
              .toLowerCase()
              .includes(q)
          : true,
      )
      .sort((a, b) => {
        const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
        return newestFirst ? diff : -diff;
      });
  }, [items, category, source, query, newestFirst]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <TopBar />

      <div className="space-y-4">
        <SearchBar value={query} onChange={setQuery} />

        {presentSources.length > 1 && (
          <div className="flex flex-wrap gap-2">
            <NesButton sfx="move" active={source === null} onClick={() => setSource(null)}>
              {t("all")}
            </NesButton>
            {presentSources.map((s) => (
              <NesButton
                key={s.id}
                sfx="move"
                active={source === s.id}
                onClick={() => setSource(s.id)}
                style={source === s.id ? { backgroundColor: s.color, color: "#0b0b1a" } : undefined}
              >
                {s.label}
              </NesButton>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <CategoryTabs
            categories={categories}
            selected={category}
            onSelect={setCategory}
          />
          <NesButton sfx="move" onClick={() => setNewestFirst((v) => !v)}>
            ↕ {newestFirst ? t("latest") : t("oldest")}
          </NesButton>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {snapshot.status === "loading" && (
          <p className="blink py-12 text-center text-xs text-coin">{t("loading")}</p>
        )}
        {snapshot.status === "error" && (
          <p className="py-12 text-center text-[10px] text-mario">
            {t("noResults")} — {snapshot.error}
          </p>
        )}
        {snapshot.status === "ready" && visible.length === 0 && (
          <p className="py-12 text-center text-xs text-ink-dim">{t("noResults")}</p>
        )}
        {visible.map((item) => (
          <NewsRow key={item.id} item={item} />
        ))}
      </div>

      {snapshot.status === "ready" && (
        <p className="mt-8 text-center text-[8px] tracking-widest text-ink-dim">
          {t("updatedAt")} {formatDate(snapshot.data.generatedAt, locale)}
        </p>
      )}
    </div>
  );
}
