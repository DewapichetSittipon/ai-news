import { Link } from "react-router-dom";
import { TopBar } from "../components/TopBar";
import { NewsRow } from "../components/NewsRow";
import { NesButton } from "../components/NesButton";
import { useSnapshotIndex } from "../hooks/useSnapshot";
import { useBookmarks } from "../hooks/useBookmarks";
import { useLocale } from "../hooks/useLocale";

export function BookmarksScreen() {
  const snapshot = useSnapshotIndex();
  const { slugs: ids } = useBookmarks();
  const { t } = useLocale();

  const items =
    snapshot.status === "ready"
      ? ids
          .map((id) => snapshot.data.items.find((i) => i.id === id))
          .filter((i): i is NonNullable<typeof i> => i !== undefined)
      : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <TopBar />

      <div className="mb-5 flex items-center gap-3">
        <Link to="/news">
          <NesButton sfx="back">← {t("back")}</NesButton>
        </Link>
        <h1 className="text-sm text-coin">★ {t("bookmarks")}</h1>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="py-12 text-center text-xs text-ink-dim">{t("noBookmarks")}</p>
        ) : (
          items.map((item) => <NewsRow key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
}
