import { useEffect, useMemo, useState } from "react";
import { marked } from "marked";
import type { Card } from "../types";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

export function CardView({ card }: { card: Card }) {
  const html = useMemo(() => marked.parse(card.content, { async: false }) as string, [card]);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [keyword, setKeyword] = useState("");
  const aiHtml = useMemo(() => (aiText ? (marked.parse(aiText, { async: false }) as string) : ""), [aiText]);

  useEffect(() => {
    setAiText("");
    setAiLoading(false);
    setAiError("");
    setKeyword("");
  }, [card.id]);

  const requestElaborate = async () => {
    setAiLoading(true);
    setAiError("");
    try {
      const res = await fetch("/api/ai/elaborate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: card.title, content: card.content, tags: card.tags, keyword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `エラー (HTTP ${res.status})`);
      setAiText(data.text);
    } catch (err: any) {
      setAiError(
        (err?.message || "取得に失敗しました") + "(ローカル開発サーバーが起動しているか確認してください)"
      );
    } finally {
      setAiLoading(false);
    }
  };

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
        {card.source && (
          <>
            <dt>ソース</dt>
            <dd>{card.source}</dd>
          </>
        )}
      </dl>
      <div className="card-detail__content" dangerouslySetInnerHTML={{ __html: html }} />
      {import.meta.env.DEV && (
        <div className="ai-elaborate">
          {!aiText && (
            <>
              <label className="ai-elaborate__keyword-field">
                指定キーワード(任意)
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="例: 明治維新"
                  disabled={aiLoading}
                />
              </label>
              <button type="button" className="ai-elaborate__btn" onClick={requestElaborate} disabled={aiLoading}>
                {aiLoading ? "生成中..." : "🔍 AIに補足してもらう"}
              </button>
            </>
          )}
          {aiError && <p className="ai-elaborate__error">{aiError}</p>}
          {aiText && (
            <>
              {keyword && <p className="ai-elaborate__used-keyword">指定キーワード: {keyword}</p>}
              <div className="ai-elaborate__result" dangerouslySetInnerHTML={{ __html: aiHtml }} />
            </>
          )}
        </div>
      )}
    </>
  );
}
