export interface Word {
  id: number;
  korean: string;
  english: string;
  x: number;
  y: number;
  highlighted: boolean;
}

export interface WordPair {
  korean: string;
  english: string;
}

export type GameDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface GameState {
  score: number;
  lives: number;
  gameOver: boolean;
  paused: boolean;
  level: number;
  activeWords: Word[];
  currentInput: string;
  targetWordIndex: number | null;
  gameStarted: boolean;
  difficulty: GameDifficulty;
}

export interface GameParams {
  spawnInterval: number;
  fallSpeed: number;
}
