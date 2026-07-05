import { Link } from "react-router-dom";
import type { Card } from "../types";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

export function CardListItem({ card }: { card: Card }) {
  return (
    <Link to={`/cards/${card.id}`} className="card-list-item">
      <div className="card-list-item__title">
        <span className={`type-badge type-badge--${card.type}`}>
          {card.type === "note" ? "ノート" : "カード"}
        </span>
        {card.title}
      </div>
      <div className="card-list-item__meta">
        <span>{formatDate(card.createdAt)}</span>
        {card.tags.length > 0 && <span className="card-list-item__tags">{card.tags.join(" / ")}</span>}
      </div>
    </Link>
  );
}

export function CardList({ cards }: { cards: Card[] }) {
  if (cards.length === 0) {
    return <p className="empty">該当するカードがありません。</p>;
  }
  return (
    <ul className="card-list">
      {cards.map((c) => (
        <li key={c.id}>
          <CardListItem card={c} />
        </li>
      ))}
    </ul>
  );
}
