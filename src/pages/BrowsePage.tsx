import { useMemo, useState } from "react";
import { useCards } from "../hooks/useCards";
import { TagFilter } from "../components/TagFilter";
import { TypeFilter, type TypeFilterValue } from "../components/TypeFilter";
import { CardList } from "../components/CardList";
import { YearMonthInput } from "../components/YearMonthInput";
import { filterByDateRange, type YearMonth } from "../lib/dateRange";
import type { Card } from "../types";

type Mode = "recent" | "random" | "range";

function pickRandom(cards: Card[], count: number): Card[] {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

export function BrowsePage() {
  const { cards, allTags } = useCards();
  const [mode, setMode] = useState<Mode>("recent");
  const [tags, setTags] = useState<string[]>([]);
  const [type, setType] = useState<TypeFilterValue>("all");
  const [count, setCount] = useState(10);
  const [randomSeed, setRandomSeed] = useState(0);
  const [fromYear, setFromYear] = useState<number | "">("");
  const [fromMonth, setFromMonth] = useState<number | "">("");
  const [toYear, setToYear] = useState<number | "">("");
  const [toMonth, setToMonth] = useState<number | "">("");

  const filteredBase = useMemo(() => {
    let list = cards;
    if (tags.length > 0) {
      list = list.filter((c) => c.tags.some((t) => tags.includes(t)));
    }
    if (type !== "all") {
      list = list.filter((c) => c.type === type);
    }
    return list;
  }, [cards, tags, type]);

  const results = useMemo(() => {
    if (mode === "recent") {
      return [...filteredBase].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, count);
    }
    if (mode === "random") {
      void randomSeed;
      return pickRandom(filteredBase, count);
    }
    const from: YearMonth | undefined = fromYear ? { year: fromYear, month: fromMonth || undefined } : undefined;
    const to: YearMonth | undefined = toYear ? { year: toYear, month: toMonth || undefined } : undefined;
    return filterByDateRange(filteredBase, from, to).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [mode, filteredBase, count, randomSeed, fromYear, fromMonth, toYear, toMonth]);

  return (
    <section className="page">
      <h2>閲覧</h2>
      <div className="browse-tabs">
        <button className={mode === "recent" ? "active" : ""} onClick={() => setMode("recent")}>
          最近登録した順
        </button>
        <button className={mode === "random" ? "active" : ""} onClick={() => setMode("random")}>
          ランダム
        </button>
        <button className={mode === "range" ? "active" : ""} onClick={() => setMode("range")}>
          期間指定
        </button>
      </div>

      <TypeFilter value={type} onChange={setType} />
      <TagFilter allTags={allTags} selected={tags} onChange={setTags} />

      {(mode === "recent" || mode === "random") && (
        <div className="browse-count">
          <label>
            件数:
            <input
              type="number"
              min={1}
              max={200}
              value={count}
              onChange={(e) => setCount(Number(e.target.value) || 1)}
            />
          </label>
          {mode === "random" && <button onClick={() => setRandomSeed((s) => s + 1)}>もう一度抽選</button>}
        </div>
      )}

      {mode === "range" && (
        <div className="browse-range">
          <YearMonthInput
            label="from"
            year={fromYear}
            month={fromMonth}
            onChange={(y, m) => {
              setFromYear(y);
              setFromMonth(m);
            }}
          />
          <YearMonthInput
            label="to"
            year={toYear}
            month={toMonth}
            onChange={(y, m) => {
              setToYear(y);
              setToMonth(m);
            }}
          />
        </div>
      )}

      <p className="result-count">{results.length}件</p>
      <CardList cards={results} />
    </section>
  );
}
