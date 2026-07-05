import { useMemo } from "react";
import cardsData from "../generated/cards.json";
import type { Card } from "../types";
import { DEFAULT_TAGS } from "../data/defaultTags";

export function useCards() {
  const cards = cardsData as Card[];
  const allTags = useMemo(() => {
    const set = new Set(DEFAULT_TAGS);
    for (const c of cards) {
      for (const t of c.tags) set.add(t);
    }
    return Array.from(set);
  }, [cards]);

  return { cards, allTags };
}
