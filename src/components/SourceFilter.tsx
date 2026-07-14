export const UNREGISTERED_SOURCE = "__unregistered__";

interface SourceFilterProps {
  allSources: string[];
  hasUnregistered: boolean;
  value: string;
  onChange: (value: string) => void;
}

export function SourceFilter({ allSources, hasUnregistered, value, onChange }: SourceFilterProps) {
  return (
    <fieldset className="source-filter">
      <legend>ソースで絞り込み</legend>
      <div className="source-filter__list">
        <label className="source-filter__item">
          <input type="radio" name="source-filter" checked={value === ""} onChange={() => onChange("")} />
          すべて
        </label>
        {hasUnregistered && (
          <label className="source-filter__item">
            <input
              type="radio"
              name="source-filter"
              checked={value === UNREGISTERED_SOURCE}
              onChange={() => onChange(UNREGISTERED_SOURCE)}
            />
            未登録
          </label>
        )}
        {allSources.map((s) => (
          <label key={s} className="source-filter__item">
            <input type="radio" name="source-filter" checked={value === s} onChange={() => onChange(s)} />
            {s}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
