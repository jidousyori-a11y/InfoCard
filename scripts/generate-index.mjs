import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { NOTE_THRESHOLD } from "../src/shared/constants.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
export const CARDS_DIR = path.join(ROOT, "content", "cards");
export const OUTPUT_FILE = path.join(ROOT, "src", "generated", "cards.json");

export function generateIndex() {
  if (!fs.existsSync(CARDS_DIR)) {
    fs.mkdirSync(CARDS_DIR, { recursive: true });
  }

  const files = fs
    .readdirSync(CARDS_DIR)
    .filter((f) => f.endsWith(".md"));

  const cards = files.map((file) => {
    const raw = fs.readFileSync(path.join(CARDS_DIR, file), "utf-8");
    const { data, content } = matter(raw);
    const trimmed = content.trim();
    return {
      id: data.id ?? file.replace(/\.md$/, ""),
      title: data.title ?? "(無題)",
      tags: Array.isArray(data.tags) ? data.tags : [],
      createdAt: data.createdAt ?? null,
      updatedAt: data.updatedAt ?? null,
      content: trimmed,
      type: trimmed.length > NOTE_THRESHOLD ? "note" : "card",
      source: typeof data.source === "string" ? data.source : "",
    };
  });

  cards.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(cards, null, 2), "utf-8");

  return cards;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  const cards = generateIndex();
  console.log(`generated ${cards.length} card(s) -> ${path.relative(ROOT, OUTPUT_FILE)}`);
}
