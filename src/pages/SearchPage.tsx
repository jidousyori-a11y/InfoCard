import { useMemo, useState } from "react";
import { useCards } from "../hooks/useCards";
import { TagFilter } from "../components/TagFilter";
import { TypeFilter, type TypeFilterValue } from "../components/TypeFilter";
import { CardList } from "../components/CardList";
import { searchCards } from "../lib/search";

export function SearchPage() {
  const { cards, allTags } = useCards();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"title" | "full">("full");
  const [tags, setTags] = useState<string[]>([]);
  const [type, setType] = useState<TypeFilterValue>("all");

  const results = useMemo(() => {
    let list = searchCards(cards, query, mode);
    if (tags.length > 0) {
      list = list.filter((c) => c.tags.some((t) => tags.includes(t)));
    }
    if (type !== "all") {
      list = list.filter((c) => c.type === type);
    }
    return list;
  }, [cards, query, mode, tags, type]);

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
      <p className="result-count">{results.length}件</p>
      <CardList cards={results} />
    </section>
  );
}
