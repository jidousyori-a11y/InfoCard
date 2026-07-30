const GEMINI_MODEL = "gemini-2.5-flash";
const PROMPT_FILE = `${import.meta.env.BASE_URL}prompts/elaborate.md`;

export interface ElaborateVars {
  title: string;
  content: string;
  tags: string[];
  keyword: string;
}

async function buildPrompt(vars: ElaborateVars): Promise<string> {
  const res = await fetch(PROMPT_FILE);
  if (!res.ok) throw new Error("プロンプトファイル(prompts/elaborate.md)の読み込みに失敗しました。");
  const template = await res.text();
  const values: Record<string, string> = {
    title: vars.title,
    tags: vars.tags.join(", ") || "(なし)",
    content: vars.content,
    keyword: vars.keyword || "(なし)",
  };
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => values[key] ?? "");
}

// ブラウザから直接Gemini APIを呼ぶ経路。
// この端末のlocalStorageに保存されたキーのみを使用し、キーはGoogleへのリクエスト以外には送信しない。
export async function callElaborateDirect(vars: ElaborateVars, apiKey: string): Promise<string> {
  const prompt = await buildPrompt(vars);
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `Gemini API エラー (HTTP ${res.status})`);
  const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || "").join("") || "";
  if (!text) throw new Error("Gemini から有効な応答が得られませんでした。");
  return text;
}

// ローカル開発サーバー(vite の aiApiPlugin)経由の経路。キーはサーバー側の環境変数から読まれ、ブラウザには渡らない。
export async function callElaborateViaServer(vars: ElaborateVars): Promise<string> {
  const res = await fetch("/api/ai/elaborate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(vars),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `エラー (HTTP ${res.status})`);
  return data.text;
}
