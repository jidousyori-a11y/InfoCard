import type { CardType } from "../types";

export type TypeFilterValue = CardType | "all";

interface TypeFilterProps {
  value: TypeFilterValue;
  onChange: (value: TypeFilterValue) => void;
}

const OPTIONS: { value: TypeFilterValue; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "card", label: "情報カードのみ" },
  { value: "note", label: "情報ノートのみ" },
];

export function TypeFilter({ value, onChange }: TypeFilterProps) {
  return (
    <fieldset className="type-filter">
      <legend>種別</legend>
      <div className="type-filter__list">
        {OPTIONS.map((opt) => (
          <label key={opt.value} className="type-filter__item">
            <input
              type="radio"
              name="type-filter"
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
            />
            {opt.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
