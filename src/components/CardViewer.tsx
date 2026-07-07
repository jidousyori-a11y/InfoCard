import { useEffect, useState } from "react";
import { CardView } from "./CardView";
import { TagFilter } from "./TagFilter";
import { recordViewed } from "../lib/lastViewed";
import { useCards } from "../hooks/useCards";
import { NOTE_THRESHOLD } from "../shared/constants.mjs";
import type { Card } from "../types";

interface CardViewerProps {
  cards: Card[];
  onExit: () => void;
  onCardUpdated: (card: Card) => void;
}

export function CardViewer({ cards, onExit, onCardUpdated }: CardViewerProps) {
  const { allTags } = useCards();
  const [index, setIndex] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const current = cards[index];
  const isLast = index === cards.length - 1;

  useEffect(() => {
    if (current) recordViewed(current.id);
  }, [current]);

  useEffect(() => {
    setEditing(false);
    setStatus("");
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

  const startEditing = () => {
    setEditTitle(current.title);
    setEditContent(current.content);
    setEditTags(current.tags);
    setStatus("");
    setEditing(true);
  };

  const save = async () => {
    setStatus("送信中...");
    try {
      const res = await fetch(`/api/cards/${current.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, content: editContent, tags: editTags }),
      });
      if (res.ok) {
        onCardUpdated({
          ...current,
          title: editTitle,
          content: editContent,
          tags: editTags,
          updatedAt: new Date().toISOString(),
          type: editContent.trim().length > NOTE_THRESHOLD ? "note" : "card",
        });
        setEditing(false);
      } else {
        setStatus("保存に失敗しました。");
      }
    } catch {
      setStatus("保存に失敗しました(ローカル開発サーバーが起動しているか確認してください)。");
    }
  };

  if (editing) {
    return (
      <div className="card-viewer">
        <p className="card-viewer__position">
          {index + 1} / {cards.length}
        </p>
        <div className="card-viewer__card card-viewer__edit">
          <label className="field">
            タイトル
            <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
          </label>
          <label className="field">
            本文(Markdown)
            <textarea rows={10} value={editContent} onChange={(e) => setEditContent(e.target.value)} />
          </label>
          <p className="register-page__type-hint">
            {editContent.trim().length}字 →{" "}
            {editContent.trim().length > NOTE_THRESHOLD
              ? `情報ノートになります(${NOTE_THRESHOLD}字超)`
              : `情報カードになります(${NOTE_THRESHOLD}字以下)`}
          </p>
          <TagFilter allTags={allTags} selected={editTags} onChange={setEditTags} />
          {status && <p className="register-page__status">{status}</p>}
        </div>
        <div className="card-viewer__edit-actions">
          <button type="button" className="card-viewer__next" onClick={save} disabled={!editTitle.trim()}>
            上書き保存
          </button>
          <button type="button" onClick={() => setEditing(false)}>
            キャンセル
          </button>
        </div>
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
      <div className="card-viewer__actions">
        {import.meta.env.DEV && (
          <button type="button" className="card-viewer__edit-entry" onClick={startEditing}>
            編集する
          </button>
        )}
        <button
          type="button"
          className="card-viewer__next"
          onClick={() => (isLast ? onExit() : setIndex((i) => i + 1))}
        >
          {isLast ? "終了" : "次へ"}
        </button>
      </div>
    </div>
  );
}
