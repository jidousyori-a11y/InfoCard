import { useMemo } from "react";
import { useCards } from "../hooks/useCards";
import { computeSourceStats } from "../lib/sourceStats";
import { SourcePieChart } from "../components/SourcePieChart";

export function StatsPage() {
  const { cards } = useCards();
  const stats = useMemo(() => computeSourceStats(cards), [cards]);

  return (
    <section className="page stats-page">
      <h2>統計</h2>
      <p className="stats-page__desc">
        全カードの「ソース」を第一カテゴリ(「：」より前)・第二カテゴリ(「：」の後)・第三カテゴリ(「（）」内)に分解して集計しています。カードの登録・編集内容から毎回その場で計算されるため、常に最新の内容を反映します。
      </p>

      <h3>第一カテゴリの割合</h3>
      <SourcePieChart data={stats.cat1Stats} colorSlot={stats.cat1ColorSlot} total={stats.total} />

      <h3>カテゴリ別内訳</h3>
      <div className="stats-table-wrap">
        <table className="stats-table">
          <thead>
            <tr>
              <th>第一カテゴリ</th>
              <th>第二カテゴリ</th>
              <th>件数</th>
            </tr>
          </thead>
          <tbody>
            {stats.rows.map((row) => (
              <tr key={`${row.cat1}-${row.cat2}`}>
                <td>{row.cat1}</td>
                <td>{row.cat2}</td>
                <td className="stats-table__count">{row.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
