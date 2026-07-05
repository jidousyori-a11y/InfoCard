import { useMemo, useState } from "react";
import { useCards } from "../hooks/useCards";
import { TagFilter } from "../components/TagFilter";
import { NOTE_THRESHOLD } from "../shared/constants.mjs";

export function RegisterPage() {
  const { cards, allTags } = useCards();
  const [editingId, setEditingId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [status, setStatus] = useState("");

  const sortedCards = useMemo(
    () => [...cards].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [cards]
  );

  const loadForEdit = (id: string) => {
    setEditingId(id);
    setStatus("");
    if (!id) {
      setTitle("");
      setContent("");
      setTags([]);
      return;
    }
    const card = cards.find((c) => c.id === id);
    if (card) {
      setTitle(card.title);
      setContent(card.content);
      setTags(card.tags);
    }
  };

  const addNewTag = () => {
    const t = newTag.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setNewTag("");
  };

  const submit = async () => {
    setStatus("送信中...");
    const payload = { title, content, tags };
    const url = editingId ? `/api/cards/${editingId}` : "/api/cards";
    const method = editingId ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setStatus("保存しました。ページを再読み込みします...");
        setTimeout(() => location.reload(), 500);
      } else {
        setStatus("保存に失敗しました。");
      }
    } catch {
      setStatus("保存に失敗しました(ローカル開発サーバーが起動しているか確認してください)。");
    }
  };

  return (
    <section className="page register-page">
      <h2>登録・編集</h2>
      <p className="register-page__note">
        このページはローカル開発時のみ利用できます。保存すると content/cards/ 配下にMarkdownファイルが作成・更新されます。反映後は
        git commit / push して公開サイトに反映してください。
      </p>

      <label className="field">
        編集対象
        <select value={editingId} onChange={(e) => loadForEdit(e.target.value)}>
          <option value="">(新規登録)</option>
          {sortedCards.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        タイトル
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>

      <label className="field">
        本文(Markdown)
        <textarea rows={10} value={content} onChange={(e) => setContent(e.target.value)} />
      </label>
      <p className="register-page__type-hint">
        {content.trim().length}字 →{" "}
        {content.trim().length > NOTE_THRESHOLD
          ? `情報ノートとして登録されます(${NOTE_THRESHOLD}字超)`
          : `情報カードとして登録されます(${NOTE_THRESHOLD}字以下)`}
      </p>

      <TagFilter allTags={allTags} selected={tags} onChange={setTags} />

      <div className="register-page__new-tag">
        <input
          placeholder="新しいタグを追加"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addNewTag()}
        />
        <button type="button" onClick={addNewTag}>
          追加
        </button>
      </div>

      <button className="register-page__submit" onClick={submit} disabled={!title.trim()}>
        {editingId ? "更新する" : "登録する"}
      </button>
      {status && <p className="register-page__status">{status}</p>}
    </section>
  );
}
