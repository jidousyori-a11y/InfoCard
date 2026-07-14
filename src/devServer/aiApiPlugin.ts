import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";

const GEMINI_MODEL = "gemini-2.5-flash";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROMPT_FILE = path.join(__dirname, "prompts", "elaborate.md");

/**
 * プロンプトのテンプレートは prompts/elaborate.md に外だししてある。
 * リクエストのたびに読み直すので、devサーバーを再起動せずに文面を調整できる。
 */
function renderPrompt(vars: Record<string, string>): string {
  const template = fs.readFileSync(PROMPT_FILE, "utf-8");
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? "");
}

function readBody(req: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk: any) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

/**
 * 開発サーバー限定のAI補助API(カードの深掘り質問・補足の生成)。
 * ビルド出力(dist)には一切含まれないため、公開サイト(GitHub Pages)には存在しない。
 * Gemini APIキーはこのプロセスの環境変数 GEMINI_API_KEY からのみ読み取り、
 * ソースコードにもレスポンスにも一切含めない。
 */
export function aiApiPlugin(): Plugin {
  return {
    name: "ai-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method !== "POST" || req.url !== "/api/ai/elaborate") return next();
        res.setHeader("Content-Type", "application/json; charset=utf-8");

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: "環境変数 GEMINI_API_KEY が設定されていません。" }));
          return;
        }

        let body: any;
        try {
          body = await readBody(req);
        } catch {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: "リクエストの形式が不正です。" }));
          return;
        }

        const title = (body.title ?? "").toString().trim();
        const content = (body.content ?? "").toString().trim();
        const tags = Array.isArray(body.tags) ? body.tags.join(", ") : "";
        const keyword = (body.keyword ?? "").toString().trim();
        if (!title || !content) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: "カード情報が不足しています。" }));
          return;
        }

        let prompt: string;
        try {
          prompt = renderPrompt({ title, tags: tags || "(なし)", content, keyword });
        } catch (err: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: "プロンプトテンプレートの読み込みに失敗しました: " + err.message }));
          return;
        }

        try {
          const apiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
            }
          );
          const data: any = await apiRes.json();

          if (!apiRes.ok) {
            res.statusCode = apiRes.status;
            res.end(JSON.stringify({ error: data?.error?.message || `Gemini API エラー (HTTP ${apiRes.status})` }));
            return;
          }

          const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || "").join("") || "";
          if (!text) {
            res.statusCode = 502;
            res.end(JSON.stringify({ error: "Gemini から有効な応答が得られませんでした。" }));
            return;
          }

          res.statusCode = 200;
          res.end(JSON.stringify({ text }));
        } catch (err: any) {
          res.statusCode = 502;
          res.end(JSON.stringify({ error: "Gemini API への接続に失敗しました: " + err.message }));
        }
      });
    },
  };
}
