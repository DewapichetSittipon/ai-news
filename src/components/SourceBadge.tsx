import type { SourceId } from "../types";
import { SOURCES } from "../sources";

/** A coloured pixel chip identifying which AI lab a News Item came from. */
export function SourceBadge({ source }: { source: SourceId }) {
  const info = SOURCES[source];
  if (!info) return null;
  return (
    <span
      className="px-1 py-0.5 text-[8px] uppercase tracking-widest text-bg"
      style={{ backgroundColor: info.color }}
      title={info.label}
    >
      {info.short}
    </span>
  );
}
