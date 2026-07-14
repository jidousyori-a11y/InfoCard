import type { Card } from "../types";

/**
 * 全角/半角(「３」と「3」、「：」と「:」など)の表記ゆれを区別せずに照合するための正規化。
 * NFKCは全角英数記号を対応する半角に、半角カナを全角にといった互換分解+正規化を行う。
 */
export function normalizeForSearch(s: string): string {
  return s.normalize("NFKC").toLowerCase();
}

/**
 * ソースの絞り込みでは「TV：100分de名著」のような値を「TV」でグループ化する。
 * 「：」がなければ全体をそのままグループとして扱う。
 */
export function sourceGroup(source: string): string {
  const idx = source.indexOf("：");
  return idx === -1 ? source : source.slice(0, idx);
}

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
