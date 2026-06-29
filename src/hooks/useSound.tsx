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

const STORAGE_KEY = "claude-news:sound";

type Sfx = "move" | "select" | "back" | "toggle" | "coin";

interface SoundContextValue {
  enabled: boolean;
  setEnabled: (on: boolean) => void;
  play: (sfx: Sfx) => void;
}

const SoundContext = createContext<SoundContextValue | null>(null);

// Square-wave blips synthesised on the fly — no audio assets needed.
const VOICES: Record<Sfx, { freq: number; dur: number; type: OscillatorType }> = {
  move: { freq: 440, dur: 0.05, type: "square" },
  select: { freq: 660, dur: 0.09, type: "square" },
  back: { freq: 220, dur: 0.08, type: "square" },
  toggle: { freq: 520, dur: 0.06, type: "triangle" },
  coin: { freq: 988, dur: 0.12, type: "square" },
};

export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabledState] = useState<boolean>(
    () => localStorage.getItem(STORAGE_KEY) !== "off",
  );
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
  }, [enabled]);

  const play = useCallback(
    (sfx: Sfx) => {
      if (!enabled) return;
      // AudioContext can only start after a user gesture; lazily create it.
      const AC = window.AudioContext ?? (window as unknown as {
        webkitAudioContext?: typeof AudioContext;
      }).webkitAudioContext;
      if (!AC) return;
      const audio = (ctxRef.current ??= new AC());
      if (audio.state === "suspended") void audio.resume();

      const { freq, dur, type } = VOICES[sfx];
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.06, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + dur);
      osc.connect(gain).connect(audio.destination);
      osc.start();
      osc.stop(audio.currentTime + dur);
    },
    [enabled],
  );

  const value = useMemo<SoundContextValue>(
    () => ({ enabled, setEnabled: setEnabledState, play }),
    [enabled, play],
  );

  return <SoundContext value={value}>{children}</SoundContext>;
}

export function useSound(): SoundContextValue {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSound must be used within <SoundProvider>");
  return ctx;
}
