import { useMemo, useState } from "react";
import { useCards } from "../hooks/useCards";
import { TagFilter } from "../components/TagFilter";
import { TypeFilter, type TypeFilterValue } from "../components/TypeFilter";
import { SourceFilter, UNREGISTERED_SOURCE } from "../components/SourceFilter";
import { CardList } from "../components/CardList";
import { searchCards, normalizeForSearch, sourceGroup } from "../lib/search";

export function SearchPage() {
  const { cards, allTags, allSourceGroups } = useCards();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"title" | "full">("full");
  const [tags, setTags] = useState<string[]>([]);
  const [type, setType] = useState<TypeFilterValue>("all");
  const [sourceFilter, setSourceFilter] = useState<string[]>([]);
  const [sourceQuery, setSourceQuery] = useState("");

  const hasUnregisteredSource = useMemo(() => cards.some((c) => !c.source), [cards]);

  const results = useMemo(() => {
    let list = searchCards(cards, query, mode);
    if (tags.length > 0) {
      list = list.filter((c) => c.tags.some((t) => tags.includes(t)));
    }
    if (type !== "all") {
      list = list.filter((c) => c.type === type);
    }
    if (sourceFilter.length > 0) {
      const targets = sourceFilter.map((f) => (f === UNREGISTERED_SOURCE ? f : normalizeForSearch(f)));
      list = list.filter((c) => {
        if (!c.source) return targets.includes(UNREGISTERED_SOURCE);
        return targets.includes(normalizeForSearch(sourceGroup(c.source)));
      });
    }
    if (sourceQuery.trim()) {
      const target = normalizeForSearch(sourceQuery.trim());
      list = list.filter((c) => normalizeForSearch(c.source).includes(target));
    }
    return list;
  }, [cards, query, mode, tags, type, sourceFilter, sourceQuery]);

  return (
    <section className="page">
      <h2>検索</h2>
      <div className="search-controls">
        <input
          type="search"
          placeholder="キーワードを入力"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="search-controls__mode">
          <label>
            <input type="radio" name="mode" checked={mode === "full"} onChange={() => setMode("full")} />
            全文検索(本文含む)
          </label>
          <label>
            <input type="radio" name="mode" checked={mode === "title"} onChange={() => setMode("title")} />
            タイトルのみ
          </label>
        </div>
      </div>
      <TypeFilter value={type} onChange={setType} />
      <TagFilter allTags={allTags} selected={tags} onChange={setTags} />
      <SourceFilter
        allSources={allSourceGroups}
        hasUnregistered={hasUnregisteredSource}
        selected={sourceFilter}
        onChange={setSourceFilter}
      />
      <label className="field">
        ソースの部分一致検索
        <input
          type="search"
          placeholder="例: 日経"
          value={sourceQuery}
          onChange={(e) => setSourceQuery(e.target.value)}
        />
      </label>
      <p className="result-count">{results.length}件</p>
      <CardList cards={results} />
    </section>
  );
}
