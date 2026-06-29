import type { SourceId } from "./types";

export interface SourceInfo {
  id: SourceId;
  label: string;
  /** Short tag shown on news cards. */
  short: string;
  /** Tailwind-arbitrary hex used for the source's pixel badge. */
  color: string;
}

// Display metadata for each AI lab. The build-side feed config lives separately
// in scripts/sources.ts; this is purely for the UI.
export const SOURCES: Record<SourceId, SourceInfo> = {
  anthropic: { id: "anthropic", label: "Anthropic", short: "CLAUDE", color: "#d97757" },
  openai: { id: "openai", label: "OpenAI", short: "OPENAI", color: "#10a37f" },
  deepmind: { id: "deepmind", label: "Google DeepMind", short: "DEEPMIND", color: "#4285f4" },
  "google-ai": { id: "google-ai", label: "Google AI", short: "GOOGLE", color: "#ea4335" },
  huggingface: { id: "huggingface", label: "Hugging Face", short: "HF", color: "#ffcc4d" },
};

export const SOURCE_LIST: SourceInfo[] = Object.values(SOURCES);
