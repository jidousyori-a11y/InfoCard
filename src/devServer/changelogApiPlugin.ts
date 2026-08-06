import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";
import { generateChangelog, NOTES_FILE } from "../../scripts/generate-changelog.mjs";

interface ChangeNote {
  id: number;
  text: string;
  createdAt: string;
}

function readNotes(): ChangeNote[] {
  if (!fs.existsSync(NOTES_FILE)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(NOTES_FILE, "utf-8"));
    return Array.isArray(parsed.notes) ? parsed.notes : [];
  } catch {
    return [];
  }
}

// notes.json(正本、gitで追跡)への書き込みと同時に、src/generated/changelogNotes.json
// (buildStart時にも再生成される、ビルド出力に含めるための静的JSON)を更新する。
// cards.json(content/cards/*.md → generateIndex())と同じ「正本→生成物」の関係。
function writeNotes(notes: ChangeNote[]): void {
  fs.writeFileSync(NOTES_FILE, JSON.stringify({ notes }));
  generateChangelog();
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
 * 開発サーバー限定の更改メモAPI。ビルド出力(dist)には含まれず、
 * GitHub Pages等の静的配信では書き込みができない(読み取りは静的JSON経由で可能)。
 */
export function changelogApiPlugin(): Plugin {
  return {
    name: "changelog-api",
    buildStart() {
      writeNotes(readNotes());
    },
    configureServer(server) {
      // notes.json がAPI経由(このプラグイン自身の書き込み)以外で変わった場合
      // (直接の手編集など)も検知して changelogNotes.json を追従させる。
      server.watcher.add(NOTES_FILE);
      server.watcher.on("change", (file) => {
        if (path.resolve(file) === path.resolve(NOTES_FILE)) generateChangelog();
      });

      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/changelog")) return next();
        res.setHeader("Content-Type", "application/json; charset=utf-8");

        try {
          if (req.method === "POST" && req.url === "/api/changelog") {
            const body = await readBody(req);
            const text = (body.text ?? "").toString().trim();
            if (!text) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: "メモを入力してください" }));
              return;
            }
            const notes = readNotes();
            const nextId = notes.reduce((max, n) => Math.max(max, n.id), 0) + 1;
            const note: ChangeNote = { id: nextId, text, createdAt: new Date().toISOString() };
            writeNotes([note, ...notes]);
            res.statusCode = 201;
            res.end(JSON.stringify(note));
            return;
          }

          const match = req.url.match(/^\/api\/changelog\/(\d+)$/);

          if (req.method === "PATCH" && match) {
            const id = Number(match[1]);
            const body = await readBody(req);
            const text = (body.text ?? "").toString().trim();
            if (!text) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: "メモを入力してください" }));
              return;
            }
            const notes = readNotes();
            const idx = notes.findIndex((n) => n.id === id);
            if (idx === -1) {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: "not found" }));
              return;
            }
            notes[idx] = { ...notes[idx], text };
            writeNotes(notes);
            res.statusCode = 200;
            res.end(JSON.stringify(notes[idx]));
            return;
          }

          if (req.method === "DELETE" && match) {
            const id = Number(match[1]);
            const notes = readNotes().filter((n) => n.id !== id);
            writeNotes(notes);
            res.statusCode = 200;
            res.end(JSON.stringify({ ok: true }));
            return;
          }

          res.statusCode = 404;
          res.end(JSON.stringify({ error: "not found" }));
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: String(err) }));
        }
      });
    },
  };
}
