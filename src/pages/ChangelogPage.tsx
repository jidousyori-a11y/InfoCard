import { useState } from "react";
import changelogNotes from "../generated/changelogNotes.json";

interface ChangeNote {
  id: number;
  text: string;
  createdAt: string;
}

// 開発サーバーでの追加・編集・削除の直後は location.reload() で
// 再生成された generated/changelogNotes.json を読み直す(RegisterPageと同じ方式)。
export function ChangelogPage() {
  const notes = changelogNotes as ChangeNote[];
  const isDev = import.meta.env.DEV;

  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  async function handleAdd() {
    const trimmed = text.trim();
    if (!trimmed) return;
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/changelog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? `HTTP ${res.status}`);
      location.reload();
    } catch (err) {
      setStatus("保存に失敗しました: " + (err instanceof Error ? err.message : String(err)));
      setBusy(false);
    }
  }

  async function handleSaveEdit(id: number) {
    const trimmed = editingText.trim();
    if (!trimmed) return;
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/changelog/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? `HTTP ${res.status}`);
      location.reload();
    } catch (err) {
      setStatus("保存に失敗しました: " + (err instanceof Error ? err.message : String(err)));
      setBusy(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("このメモを削除しますか？")) return;
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/changelog/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? `HTTP ${res.status}`);
      location.reload();
    } catch (err) {
      setStatus("削除に失敗しました: " + (err instanceof Error ? err.message : String(err)));
      setBusy(false);
    }
  }

  return (
    <section className="page changelog-page">
      <h2>更改メモ</h2>
      <p className="register-page__note">
        アプリの仕様・制約・今後の検討事項などを自由に書き留めておく場所です（カード本体とは別管理）。
        {!isDev && "（追加・編集・削除はローカルの開発サーバー起動時のみ行えます）"}
      </p>

      {isDev && (
        <label className="field">
          <textarea
            className="changelog-page__textarea"
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="メモを入力"
          />
          <button className="register-page__submit" onClick={handleAdd} disabled={busy || !text.trim()}>
            追加
          </button>
        </label>
      )}
      {status && <p className="register-page__status">{status}</p>}

      {notes.length === 0 ? (
        <p className="empty">メモはまだありません。</p>
      ) : (
        <ul className="changelog-page__list">
          {notes.map((n) => (
            <li key={n.id} className="changelog-page__item">
              {editingId === n.id ? (
                <>
                  <textarea
                    className="changelog-page__textarea"
                    rows={3}
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                  />
                  <div className="register-page__actions">
                    <button className="register-page__submit" onClick={() => handleSaveEdit(n.id)} disabled={busy}>
                      保存
                    </button>
                    <button onClick={() => setEditingId(null)} disabled={busy}>
                      キャンセル
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="changelog-page__date">{new Date(n.createdAt).toLocaleString("ja-JP")}</div>
                  <div className="changelog-page__text">{n.text}</div>
                  {isDev && (
                    <div className="register-page__actions">
                      <button
                        onClick={() => {
                          setEditingId(n.id);
                          setEditingText(n.text);
                        }}
                        disabled={busy}
                      >
                        編集
                      </button>
                      <button className="register-page__delete" onClick={() => handleDelete(n.id)} disabled={busy}>
                        削除
                      </button>
                    </div>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
