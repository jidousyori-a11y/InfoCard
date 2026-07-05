import type { Card } from "../types";

export interface YearMonth {
  year: number;
  /** 1-12。未指定はその年全体を表す */
  month?: number;
}

export function isWithinRange(createdAt: string, from?: YearMonth, to?: YearMonth): boolean {
  const date = new Date(createdAt);
  const y = date.getFullYear();
  const m = date.getMonth() + 1;

  if (from) {
    if (y < from.year) return false;
    if (y === from.year && from.month && m < from.month) return false;
  }
  if (to) {
    if (y > to.year) return false;
    if (y === to.year && to.month && m > to.month) return false;
  }
  return true;
}

export function filterByDateRange(cards: Card[], from?: YearMonth, to?: YearMonth): Card[] {
  if (!from && !to) return cards;
  return cards.filter((c) => isWithinRange(c.createdAt, from, to));
}
