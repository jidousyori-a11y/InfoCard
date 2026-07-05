const STORAGE_KEY = "joho-card:last-viewed";

function readMap(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function recordViewed(id: string): void {
  const map = readMap();
  map[id] = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function getLastViewed(id: string): string | null {
  return readMap()[id] ?? null;
}
