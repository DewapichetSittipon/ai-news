import { Link } from "react-router-dom";
import type { NewsMeta } from "../types";
import { useLocale } from "../hooks/useLocale";
import { useBookmarks } from "../hooks/useBookmarks";
import { useSound } from "../hooks/useSound";
import { formatDate, isRecent } from "../lib/date";
import { SourceBadge } from "./SourceBadge";

export function NewsRow({ item }: { item: NewsMeta }) {
  const { locale, t, pick } = useLocale();
  const { has, toggle } = useBookmarks();
  const { play } = useSound();
  const saved = has(item.id);
  const title = pick(item.title);
  const summary = pick(item.summary);

  return (
    <article className="pixel-box flex gap-3 bg-panel p-3 hover:bg-panel-2">
      {item.image && (
        <img
          src={item.image}
          alt=""
          loading="lazy"
          className="hidden h-20 w-20 shrink-0 border-4 border-ink object-cover sm:block"
        />
      )}

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-[8px] uppercase tracking-widest text-ink-dim">
          <SourceBadge source={item.source} />
          <span className="bg-sky px-1 py-0.5 text-ink">{item.category}</span>
          <span>{formatDate(item.date, locale)}</span>
          {isRecent(item.date) && (
            <span className="blink bg-coin px-1 py-0.5 text-bg">{t("newBadge")}</span>
          )}
        </div>

        <Link
          to={`/news/${item.id}`}
          onClick={() => play("select")}
          className="block font-body text-xl leading-tight text-ink hover:text-coin"
        >
          {title}
        </Link>

        <p className="mt-2 line-clamp-2 font-body text-lg leading-tight text-ink-dim">
          {summary}
        </p>
      </div>

      <button
        type="button"
        aria-pressed={saved}
        aria-label={t("bookmark")}
        title={t("bookmark")}
        onClick={() => {
          play(saved ? "back" : "coin");
          toggle(item.id);
        }}
        className={`shrink-0 self-start px-2 py-1 text-sm ${
          saved ? "text-coin" : "text-ink-dim hover:text-ink"
        }`}
      >
        {saved ? "★" : "☆"}
      </button>
    </article>
  );
}
