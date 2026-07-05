import { useMemo } from "react";
import { marked } from "marked";
import type { Card } from "../types";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

export function CardView({ card }: { card: Card }) {
  const html = useMemo(() => marked.parse(card.content, { async: false }) as string, [card]);

  return (
    <>
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
    </>
  );
}
