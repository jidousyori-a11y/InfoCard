const LS_GEMINI_KEY = "jouhouCard.geminiKey.v1";

export function loadGeminiKey(): string {
  try {
    return localStorage.getItem(LS_GEMINI_KEY) || "";
  } catch {
    return "";
  }
}

export function saveGeminiKey(key: string): void {
  localStorage.setItem(LS_GEMINI_KEY, key);
}

export function clearGeminiKey(): void {
  localStorage.removeItem(LS_GEMINI_KEY);
}
