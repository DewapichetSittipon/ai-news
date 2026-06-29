import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocale } from "../hooks/useLocale";
import { useSound } from "../hooks/useSound";
import { NesButton } from "../components/NesButton";

export function BootScreen() {
  const { t } = useLocale();
  const { play } = useSound();
  const navigate = useNavigate();

  const start = () => {
    play("coin");
    navigate("/news");
  };

  // Let the keyboard "press start" too.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") start();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-10 px-6 text-center">
      <div className="space-y-4">
        <h1 className="text-2xl text-coin sm:text-4xl">{t("appTitle")}</h1>
        <p className="text-[9px] tracking-widest text-grass sm:text-xs">
          {t("subtitle")}
        </p>
      </div>

      <pre aria-hidden className="text-mario leading-none text-[10px] sm:text-base">
        {`   ▲   \n  ◀●▶  \n   ▼   `}
      </pre>

      <button type="button" onClick={start} className="blink text-sm text-ink">
        {t("pressStart")}
      </button>

      <NesButton sfx="coin" onClick={start} className="px-8 py-4">
        {t("start")}
      </NesButton>
    </main>
  );
}
