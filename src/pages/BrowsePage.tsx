import { useMemo, useState } from "react";
import { useCards } from "../hooks/useCards";
import { TagFilter } from "../components/TagFilter";
import { TypeFilter, type TypeFilterValue } from "../components/TypeFilter";
import { CardList } from "../components/CardList";
import { CardViewer } from "../components/CardViewer";
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
  const [mode, setMode] = useState<Mode>("random");
  const [tags, setTags] = useState<string[]>([]);
  const [type, setType] = useState<TypeFilterValue>("all");
  const [randomType, setRandomType] = useState<TypeFilterValue>("card");
  const [count, setCount] = useState(10);
  const [session, setSession] = useState<Card[] | null>(null);
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
    if (mode === "range") {
      const from: YearMonth | undefined = fromYear ? { year: fromYear, month: fromMonth || undefined } : undefined;
      const to: YearMonth | undefined = toYear ? { year: toYear, month: toMonth || undefined } : undefined;
      return filterByDateRange(filteredBase, from, to).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return [];
  }, [mode, filteredBase, count, fromYear, fromMonth, toYear, toMonth]);

  const randomPool = useMemo(() => {
    let list = cards;
    if (tags.length > 0) {
      list = list.filter((c) => c.tags.some((t) => tags.includes(t)));
    }
    if (randomType !== "all") {
      list = list.filter((c) => c.type === randomType);
    }
    return list;
  }, [cards, tags, randomType]);

  const startViewing = () => {
    setSession(pickRandom(randomPool, count));
  };

  const isViewing = mode === "random" && session !== null;

  const recentlyAdded = useMemo(
    () => [...cards].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 10),
    [cards]
  );

  return (
    <section className="page">
      <h2>閲覧</h2>

      {!isViewing && (
        <div className="browse-tabs">
          <button className={mode === "random" ? "active" : ""} onClick={() => setMode("random")}>
            ランダム
          </button>
          <button className={mode === "recent" ? "active" : ""} onClick={() => setMode("recent")}>
            最近登録した順
          </button>
          <button className={mode === "range" ? "active" : ""} onClick={() => setMode("range")}>
            期間指定
          </button>
        </div>
      )}

      {isViewing ? (
        <CardViewer
          cards={session}
          onExit={() => setSession(null)}
          onCardUpdated={(updated) =>
            setSession((prev) => (prev ? prev.map((c) => (c.id === updated.id ? updated : c)) : prev))
          }
        />
      ) : (
        <>
          <TypeFilter value={mode === "random" ? randomType : type} onChange={mode === "random" ? setRandomType : setType} />
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
              {mode === "random" && (
                <button onClick={startViewing}>抽選して鑑賞する</button>
              )}
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

          {mode !== "random" && (
            <>
              <p className="result-count">{results.length}件</p>
              <CardList cards={results} />
            </>
          )}
        </>
      )}

      {!isViewing && (
        <div className="browse-recent">
          <h3>最近登録したカード</h3>
          <CardList cards={recentlyAdded} />
        </div>
      )}
    </section>
  );
}
