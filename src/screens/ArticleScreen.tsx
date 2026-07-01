import { Link, useParams } from "react-router-dom";
import { TopBar } from "../components/TopBar";
import { NesButton } from "../components/NesButton";
import { SourceBadge } from "../components/SourceBadge";
import { useArticle } from "../hooks/useSnapshot";
import { useLocale } from "../hooks/useLocale";
import { useBookmarks } from "../hooks/useBookmarks";
import { useSound } from "../hooks/useSound";
import { formatDate } from "../lib/date";
import type { Localized, NewsBlock } from "../types";

function Block({ block }: { block: NewsBlock }) {
  const { pick } = useLocale();
  const text = block.type === "img" ? "" : pick(block.text);
  switch (block.type) {
    case "h2":
      return <h2 className="mt-6 text-sm text-coin">{text}</h2>;
    case "h3":
      return <h3 className="mt-5 text-xs text-grass">{text}</h3>;
    case "li":
      return (
        <li className="ml-5 list-disc text-[11px] leading-loose text-ink">{text}</li>
      );
    case "img":
      return <img src={block.src} alt={block.alt} loading="lazy" className="my-4" />;
    default:
      return <p className="text-[11px] leading-loose text-ink">{text}</p>;
  }
}

function Headline({ title }: { title: Localized }) {
  const { pick } = useLocale();
  return <h1 className="text-base leading-relaxed text-coin">{pick(title)}</h1>;
}

export function ArticleScreen() {
  const { id } = useParams<{ id: string }>();
  const article = useArticle(id);
  const { locale, t } = useLocale();
  const { has, toggle } = useBookmarks();
  const { play } = useSound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <TopBar />

      <Link to="/news" onClick={() => play("back")}>
        <NesButton sfx="back">← {t("back")}</NesButton>
      </Link>

      {article.status === "loading" && (
        <p className="blink py-12 text-center text-xs text-coin">{t("loading")}</p>
      )}
      {article.status === "error" && (
        <p className="py-12 text-center text-[10px] text-mario">{t("notFound")}</p>
      )}

      {article.status === "ready" && (
        <article className="mt-5">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-[8px] uppercase tracking-widest text-ink-dim">
            <SourceBadge source={article.data.source} />
            <span className="bg-sky px-1 py-0.5 text-ink">{article.data.category}</span>
            <span>{formatDate(article.data.date, locale)}</span>
          </div>

          <Headline title={article.data.title} />

          <div className="mt-3 flex flex-wrap gap-2">
            <NesButton
              sfx={has(article.data.id) ? "back" : "coin"}
              active={has(article.data.id)}
              onClick={() => toggle(article.data.id)}
            >
              {has(article.data.id) ? t("bookmarked") : `☆ ${t("bookmark")}`}
            </NesButton>
            <a href={article.data.url} target="_blank" rel="noreferrer">
              <NesButton sfx="select">{t("readOriginal")}</NesButton>
            </a>
          </div>

          {article.data.image && (
            <img
              src={article.data.image}
              alt=""
              className="mt-5 w-full border-4 border-ink"
            />
          )}

          <div className="article-body mt-5 space-y-3">
            {article.data.body.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </div>
        </article>
      )}
    </div>
  );
}
