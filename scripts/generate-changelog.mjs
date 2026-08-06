import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
export const NOTES_FILE = path.join(ROOT, "notes.json");
export const OUTPUT_FILE = path.join(ROOT, "src", "generated", "changelogNotes.json");

export function generateChangelog() {
  let notes = [];
  if (fs.existsSync(NOTES_FILE)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(NOTES_FILE, "utf-8"));
      notes = Array.isArray(parsed.notes) ? parsed.notes : [];
    } catch {
      notes = [];
    }
  }

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(notes, null, 2), "utf-8");

  return notes;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  const notes = generateChangelog();
  console.log(`generated ${notes.length} changelog note(s) -> ${path.relative(ROOT, OUTPUT_FILE)}`);
}
