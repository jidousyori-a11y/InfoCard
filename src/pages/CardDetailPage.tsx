import { useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useCards } from "../hooks/useCards";
import { recordViewed } from "../lib/lastViewed";
import { CardView } from "../components/CardView";

export function CardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { cards } = useCards();
  const card = useMemo(() => cards.find((c) => c.id === id), [cards, id]);

  useEffect(() => {
    if (card) recordViewed(card.id);
  }, [card]);

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
      <div className="card-detail__nav">
        <Link to="/" className="card-detail__back">
          ← 検索に戻る
        </Link>
        {import.meta.env.DEV && (
          <Link to={`/register/${card.id}`} className="card-detail__edit">
            編集する
          </Link>
        )}
      </div>
      <CardView card={card} />
    </section>
  );
}
