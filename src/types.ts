export type CardType = "card" | "note";

export interface Card {
  id: string;
  title: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  content: string;
  /** 本文が600字を超えると自動的に "note"(情報ノート)になる。600字以下は "card"(情報カード) */
  type: CardType;
  /** 出典・参照元(書籍名、URLなど)。未設定の場合は空文字 */
  source: string;
}
