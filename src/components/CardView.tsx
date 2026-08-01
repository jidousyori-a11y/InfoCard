import { useEffect, useMemo, useState } from "react";
import { marked } from "marked";
import type { Card } from "../types";
import { loadGeminiKey, saveGeminiKey, clearGeminiKey } from "../lib/geminiKey";
import { callElaborateDirect, callElaborateViaServer } from "../lib/elaborate";

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
  const [geminiKey, setGeminiKey] = useState(() => loadGeminiKey());
  const [keyPanelOpen, setKeyPanelOpen] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const aiHtml = useMemo(() => (aiText ? (marked.parse(aiText, { async: false }) as string) : ""), [aiText]);
  const savedAiHtml = useMemo(
    () => (card.aiNote ? (marked.parse(card.aiNote, { async: false }) as string) : ""),
    [card.aiNote]
  );

  useEffect(() => {
    setAiText("");
    setAiLoading(false);
    setAiError("");
    setKeyword("");
    setSaveStatus("");
  }, [card.id]);

  const saveAiNote = async () => {
    setSaving(true);
    setSaveStatus("");
    try {
      const res = await fetch(`/api/cards/${encodeURIComponent(card.id)}/ai-note`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiNote: aiText }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? `HTTP ${res.status}`);
      location.reload();
    } catch (err: any) {
      setSaveStatus("保存に失敗しました: " + (err?.message || String(err)));
      setSaving(false);
    }
  };

  const requestElaborate = async () => {
    setAiLoading(true);
    setAiError("");
    const vars = { title: card.title, content: card.content, tags: card.tags, keyword };
    try {
      const text = geminiKey ? await callElaborateDirect(vars, geminiKey) : await callElaborateViaServer(vars);
      setAiText(text);
    } catch (err: any) {
      const hint = geminiKey
        ? "(保存されているAPIキーが正しいか、下の「AI機能のAPIキー設定」から確認してください)"
        : "(ローカル開発サーバー(npm run dev)が起動しているか、下の「AI機能のAPIキー設定」でGemini APIキーを登録している場合のみ利用できます)";
      setAiError((err?.message || "取得に失敗しました") + hint);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveKey = () => {
    const v = keyInput.trim();
    if (!v) return;
    saveGeminiKey(v);
    setGeminiKey(v);
    setKeyInput("");
  };

  const handleClearKey = () => {
    if (!geminiKey) return;
    if (!confirm("この端末に保存済みのAPIキーを削除しますか？")) return;
    clearGeminiKey();
    setGeminiKey("");
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
      <div className="ai-elaborate">
        {card.aiNote ? (
          // 保存済みのAI補足があれば、再リクエストなしに最初から表示する。
          <div className="ai-elaborate__result" dangerouslySetInnerHTML={{ __html: savedAiHtml }} />
        ) : (
          <>
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
                {import.meta.env.DEV && (
                  <>
                    <button type="button" className="ai-elaborate__btn" onClick={saveAiNote} disabled={saving}>
                      {saving ? "保存中..." : "💾 この補足を保存する"}
                    </button>
                    {saveStatus && <p className="ai-elaborate__error">{saveStatus}</p>}
                  </>
                )}
              </>
            )}
          </>
        )}
        <div className="ai-key-box">
          <button type="button" className="ai-key-toggle" onClick={() => setKeyPanelOpen((v) => !v)}>
            🔑 AI機能のAPIキー設定
          </button>
          {keyPanelOpen && (
            <div className="ai-key-panel">
              <p className="ai-key-panel__desc">
                ローカル開発サーバー(npm run dev)を使わない環境(GitHub Pagesなど、スマホからのアクセス含む)でAI機能を使うには、
                Gemini APIキーをこの端末のブラウザにのみ保存してください。保存したキーはGoogleへの直接リクエスト以外には使われず、
                リポジトリやサーバーには一切送信されません。
              </p>
              <input
                type="password"
                className="ai-key-input"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder={geminiKey ? "(保存済み。変更する場合のみ入力)" : "Gemini APIキーを入力"}
                autoComplete="off"
              />
              <div className="ai-key-actions">
                <button type="button" onClick={handleSaveKey}>
                  保存
                </button>
                <button type="button" onClick={handleClearKey}>
                  削除
                </button>
              </div>
              <p className="ai-key-status">
                {geminiKey
                  ? "✅ APIキーを保存済みです。この端末ではAIリクエストが直接Googleに送られます。"
                  : "未設定です。未設定の場合、ローカル開発サーバー(npm run dev)経由での利用を試みます。"}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
