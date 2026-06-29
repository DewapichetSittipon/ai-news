import { useLocale } from "../hooks/useLocale";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: Props) {
  const { t } = useLocale();
  return (
    <label className="pixel-box flex items-center gap-3 bg-bg px-3 py-3">
      <span aria-hidden className="text-coin">🔍</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("searchPlaceholder")}
        className="w-full bg-transparent text-[10px] uppercase tracking-wider text-ink outline-none placeholder:text-ink-dim"
      />
    </label>
  );
}
