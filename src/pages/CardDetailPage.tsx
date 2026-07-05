import { useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { marked } from "marked";
import { useCards } from "../hooks/useCards";
import { recordViewed } from "../lib/lastViewed";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

export function CardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { cards } = useCards();
  const card = useMemo(() => cards.find((c) => c.id === id), [cards, id]);

  useEffect(() => {
    if (card) recordViewed(card.id);
  }, [card]);

  const html = useMemo(
    () => (card ? (marked.parse(card.content, { async: false }) as string) : ""),
    [card]
  );

  if (!card) {
    return (
      <section className="page">
        <p>カードが見つかりません。</p>
        <Link to="/">検索に戻る</Link>
      </section>
    );
  }

  return (
    <section className="page card-detail">
      <Link to="/" className="card-detail__back">
        ← 検索に戻る
      </Link>
      <h2>
        <span className={`type-badge type-badge--${card.type}`}>
          {card.type === "note" ? "ノート" : "カード"}
        </span>
        {card.title}
      </h2>
      <div className="card-detail__tags">
        {card.tags.map((t) => (
          <span key={t} className="tag-pill">
            {t}
          </span>
        ))}
      </div>
      <dl className="card-detail__meta">
        <dt>登録日</dt>
        <dd>{formatDate(card.createdAt)}</dd>
        <dt>最終更新日</dt>
        <dd>{formatDate(card.updatedAt)}</dd>
      </dl>
      <div className="card-detail__content" dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
}
