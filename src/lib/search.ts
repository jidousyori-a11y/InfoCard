import type { Card } from "../types";

/**
 * 日本語は単語間に空白がないため、トークン単位で照合するライブラリ(MiniSearchなど)では
 * 「本文中の一部分」にしか出現しない語(例: 「明智光秀」の中の「光秀」)がヒットしない。
 * そのため単純な部分一致(複数キーワードはAND)で実装する。
 */
export function searchCards(cards: Card[], query: string, mode: "title" | "full"): Card[] {
  const q = query.trim();
  if (!q) return cards;

  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  return cards.filter((c) => {
    const haystack = (mode === "title" ? c.title : `${c.title}\n${c.content}`).toLowerCase();
    return terms.every((t) => haystack.includes(t));
  });
}
