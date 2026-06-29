import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Locale, Localized } from "../types";
import { UI, type UiKey } from "../i18n/strings";

const STORAGE_KEY = "claude-news:locale";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  toggle: () => void;
  /** Pick the current locale out of a Localized value (with EN fallback). */
  pick: <T>(value: Localized<T>) => T;
  /** Translate a UI chrome string by key. */
  t: (key: UiKey) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readInitial(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "th") return stored;
  return navigator.language.startsWith("th") ? "th" : "en";
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readInitial);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => setLocaleState(l), []);
  const toggle = useCallback(
    () => setLocaleState((l) => (l === "en" ? "th" : "en")),
    [],
  );

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      toggle,
      pick: (v) => v[locale] ?? v.en,
      t: (key) => UI[key][locale] ?? UI[key].en,
    }),
    [locale, setLocale, toggle],
  );

  return <LocaleContext value={value}>{children}</LocaleContext>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within <LocaleProvider>");
  return ctx;
}
