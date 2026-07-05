interface TagFilterProps {
  allTags: string[];
  selected: string[];
  onChange: (tags: string[]) => void;
}

export function TagFilter({ allTags, selected, onChange }: TagFilterProps) {
  const toggle = (tag: string) => {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  };

  return (
    <fieldset className="tag-filter">
      <legend>タグで絞り込み(複数選択可)</legend>
      <div className="tag-filter__list">
        {allTags.map((tag) => (
          <label key={tag} className="tag-filter__item">
            <input type="checkbox" checked={selected.includes(tag)} onChange={() => toggle(tag)} />
            {tag}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
