import { useLocale } from "../hooks/useLocale";
import { NesButton } from "./NesButton";

interface Props {
  categories: string[];
  selected: string | null;
  onSelect: (category: string | null) => void;
}

export function CategoryTabs({ categories, selected, onSelect }: Props) {
  const { t } = useLocale();
  return (
    <div className="flex flex-wrap gap-2">
      <NesButton sfx="move" active={selected === null} onClick={() => onSelect(null)}>
        {t("all")}
      </NesButton>
      {categories.map((c) => (
        <NesButton
          key={c}
          sfx="move"
          active={selected === c}
          onClick={() => onSelect(c)}
        >
          {c}
        </NesButton>
      ))}
    </div>
  );
}
