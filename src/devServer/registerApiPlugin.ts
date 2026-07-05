import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";
import matter from "gray-matter";
import { generateIndex, CARDS_DIR } from "../../scripts/generate-index.mjs";

function slugify(title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return (base || "card") + "-" + Date.now().toString(36);
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
 * 開発サーバー限定のカード登録・編集API。
 * ビルド出力(dist)には一切含まれないため、公開サイトには登録機能が存在しない。
 */
export function registerApiPlugin(): Plugin {
  return {
    name: "register-api",
    buildStart() {
      generateIndex();
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/cards")) return next();
        res.setHeader("Content-Type", "application/json; charset=utf-8");

        try {
          if (req.method === "POST" && req.url === "/api/cards") {
            const body = await readBody(req);
            const now = new Date().toISOString();
            const id = slugify(body.title ?? "card");
            const frontmatter = {
              id,
              title: body.title ?? "(無題)",
              tags: Array.isArray(body.tags) ? body.tags : [],
              createdAt: now,
              updatedAt: now,
            };
            const fileContent = matter.stringify(body.content ?? "", frontmatter);
            fs.mkdirSync(CARDS_DIR, { recursive: true });
            fs.writeFileSync(path.join(CARDS_DIR, `${id}.md`), fileContent, "utf-8");
            generateIndex();
            res.statusCode = 201;
            res.end(JSON.stringify({ id, createdAt: now }));
            return;
          }

          const match = req.url.match(/^\/api\/cards\/([^/]+)$/);
          if (req.method === "PUT" && match) {
            const id = decodeURIComponent(match[1]);
            const filePath = path.join(CARDS_DIR, `${id}.md`);
            if (!fs.existsSync(filePath)) {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: "not found" }));
              return;
            }
            const body = await readBody(req);
            const existing = matter(fs.readFileSync(filePath, "utf-8"));
            const now = new Date().toISOString();
            const frontmatter = {
              id,
              title: body.title ?? existing.data.title,
              tags: Array.isArray(body.tags) ? body.tags : existing.data.tags,
              createdAt: existing.data.createdAt,
              updatedAt: now,
            };
            const fileContent = matter.stringify(body.content ?? existing.content, frontmatter);
            fs.writeFileSync(filePath, fileContent, "utf-8");
            generateIndex();
            res.statusCode = 200;
            res.end(JSON.stringify({ id, updatedAt: now }));
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
