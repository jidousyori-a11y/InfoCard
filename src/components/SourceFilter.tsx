export const UNREGISTERED_SOURCE = "__unregistered__";

interface SourceFilterProps {
  allSources: string[];
  hasUnregistered: boolean;
  selected: string[];
  onChange: (values: string[]) => void;
}

export function SourceFilter({ allSources, hasUnregistered, selected, onChange }: SourceFilterProps) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <fieldset className="source-filter">
      <legend>ソースで絞り込み(複数選択可)</legend>
      <div className="source-filter__list">
        {hasUnregistered && (
          <label className="source-filter__item">
            <input
              type="checkbox"
              checked={selected.includes(UNREGISTERED_SOURCE)}
              onChange={() => toggle(UNREGISTERED_SOURCE)}
            />
            未登録
          </label>
        )}
        {allSources.map((s) => (
          <label key={s} className="source-filter__item">
            <input type="checkbox" checked={selected.includes(s)} onChange={() => toggle(s)} />
            {s}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
