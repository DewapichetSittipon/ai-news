import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocale } from "./useLocale";

// Real-time, on-device translation using Chrome's built-in Translator API.
// No API key, no server, no rate limits — the model runs in the user's browser.
// Unsupported browsers (Safari/Firefox/older Chrome) fall back to English.
// https://developer.chrome.com/docs/ai/translator-api

type Availability = "checking" | "ready" | "downloading" | "unsupported";

interface TranslatorLike {
  translate: (text: string) => Promise<string>;
}
interface TranslatorCtor {
  availability: (o: { sourceLanguage: string; targetLanguage: string }) => Promise<string>;
  create: (o: {
    sourceLanguage: string;
    targetLanguage: string;
    monitor?: (m: EventTarget) => void;
  }) => Promise<TranslatorLike>;
}
const getCtor = (): TranslatorCtor | null =>
  (globalThis as unknown as { Translator?: TranslatorCtor }).Translator ?? null;

const CACHE_KEY = "claude-news:tcache";
const cache = new Map<string, string>();
try {
  Object.entries(JSON.parse(localStorage.getItem(CACHE_KEY) || "{}")).forEach(
    ([k, v]) => cache.set(k, v as string),
  );
} catch {
  /* ignore */
}
let saveTimer: ReturnType<typeof setTimeout> | undefined;
function persistCache() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    localStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(cache)));
  }, 500);
}

interface TranslatorContextValue {
  availability: Availability;
  progress: number;
  /** Translate EN→TH on-device; resolves to English if unavailable. */
  translate: (en: string) => Promise<string>;
}

const TranslatorContext = createContext<TranslatorContextValue | null>(null);

export function TranslatorProvider({ children }: { children: ReactNode }) {
  const [availability, setAvailability] = useState<Availability>("checking");
  const [progress, setProgress] = useState(0);
  const instanceRef = useRef<Promise<TranslatorLike | null> | null>(null);
  // Serialise translate calls so a screenful of blocks doesn't stampede.
  const queue = useRef<Promise<unknown>>(Promise.resolve());

  const ensure = useCallback((): Promise<TranslatorLike | null> => {
    if (instanceRef.current) return instanceRef.current;
    instanceRef.current = (async () => {
      const Ctor = getCtor();
      if (!Ctor) {
        setAvailability("unsupported");
        return null;
      }
      try {
        const avail = await Ctor.availability({ sourceLanguage: "en", targetLanguage: "th" });
        if (avail === "unavailable") {
          setAvailability("unsupported");
          return null;
        }
        if (avail !== "available") setAvailability("downloading");
        const inst = await Ctor.create({
          sourceLanguage: "en",
          targetLanguage: "th",
          monitor: (m) =>
            m.addEventListener("downloadprogress", (e) =>
              setProgress(Math.round(((e as ProgressEvent).loaded ?? 0) * 100)),
            ),
        });
        setAvailability("ready");
        return inst;
      } catch {
        setAvailability("unsupported");
        return null;
      }
    })();
    return instanceRef.current;
  }, []);

  const translate = useCallback(
    (en: string): Promise<string> => {
      const key = `th:${en}`;
      const hit = cache.get(key);
      if (hit !== undefined) return Promise.resolve(hit);

      const run = queue.current.then(async () => {
        const inst = await ensure();
        if (!inst) return en;
        try {
          const th = await inst.translate(en);
          cache.set(key, th);
          persistCache();
          return th;
        } catch {
          return en;
        }
      });
      queue.current = run.catch(() => undefined);
      return run;
    },
    [ensure],
  );

  const value = useMemo<TranslatorContextValue>(
    () => ({ availability, progress, translate }),
    [availability, progress, translate],
  );

  return <TranslatorContext value={value}>{children}</TranslatorContext>;
}

export function useTranslator(): TranslatorContextValue {
  const ctx = useContext(TranslatorContext);
  if (!ctx) throw new Error("useTranslator must be used within <TranslatorProvider>");
  return ctx;
}

/** Reactively translate one English string based on the current Locale. */
export function useT(en: string): string {
  const { translate } = useTranslator();
  const { locale } = useLocale();
  const [out, setOut] = useState(en);

  useEffect(() => {
    if (locale !== "th") {
      setOut(en);
      return;
    }
    let alive = true;
    translate(en).then((t) => alive && setOut(t));
    return () => {
      alive = false;
    };
  }, [en, locale, translate]);

  return out;
}
