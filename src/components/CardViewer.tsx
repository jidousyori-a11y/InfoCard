import { useEffect, useState } from "react";
import { CardView } from "./CardView";
import { recordViewed } from "../lib/lastViewed";
import type { Card } from "../types";

interface CardViewerProps {
  cards: Card[];
  onExit: () => void;
}

export function CardViewer({ cards, onExit }: CardViewerProps) {
  const [index, setIndex] = useState(0);
  const current = cards[index];
  const isLast = index === cards.length - 1;

  useEffect(() => {
    if (current) recordViewed(current.id);
  }, [current]);

  if (!current) {
    return (
      <div className="card-viewer">
        <p className="empty">該当するカードがありません。</p>
        <button type="button" className="card-viewer__next" onClick={onExit}>
          戻る
        </button>
      </div>
    );
  }

  return (
    <div className="card-viewer">
      <p className="card-viewer__position">
        {index + 1} / {cards.length}
      </p>
      <div className="card-viewer__card">
        <CardView card={current} />
      </div>
      <button
        type="button"
        className="card-viewer__next"
        onClick={() => (isLast ? onExit() : setIndex((i) => i + 1))}
      >
        {isLast ? "終了" : "次へ"}
      </button>
    </div>
  );
}
