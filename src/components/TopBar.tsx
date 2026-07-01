import { Link } from "react-router-dom";
import { useLocale } from "../hooks/useLocale";
import { useSound } from "../hooks/useSound";
import { NesButton } from "./NesButton";

export function TopBar() {
  const { locale, toggle, t } = useLocale();
  const { enabled, setEnabled, play } = useSound();

  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b-4 border-ink pb-4">
      <Link to="/" className="group flex items-center gap-3" onClick={() => play("coin")}>
        <span className="pixel-box bg-mario px-2 py-2 text-[10px] text-ink">▶</span>
        <span className="text-sm text-coin">{t("appTitle")}</span>
      </Link>

      <nav className="flex items-center gap-2">
        <Link to="/bookmarks">
          <NesButton sfx="move">★ {t("bookmarks")}</NesButton>
        </Link>
        <NesButton
          sfx="toggle"
          onClick={toggle}
          aria-label="Toggle language"
          title="TH / EN"
        >
          {locale === "en" ? "TH/EN" : "EN/TH"}
        </NesButton>
        <NesButton
          sfx="toggle"
          active={enabled}
          aria-pressed={enabled}
          onClick={() => setEnabled(!enabled)}
          aria-label="Toggle sound"
        >
          ♪ {enabled ? t("on") : t("off")}
        </NesButton>
      </nav>
    </header>
  );
}
