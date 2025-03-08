export interface GridCell {
  char: string;
  selected: boolean;
  used: boolean;
  hint: boolean;
  row: number;
  col: number;
}

export interface WordCell {
  row: number;
  col: number;
}

export interface PlacedWord {
  word: string;
  cells: WordCell[];
}

export type Direction = [number, number];

export interface Level {
  id: string;
  name: string;
  gridSize: number;
  description: string;
}

export type GameState = 'start' | 'playing';
