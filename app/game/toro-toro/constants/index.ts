import { WordPair } from "../types";

// Level presets
export const LEVELS = {
  EASY: {
    spawnInterval: 4000,
    fallSpeed: 0.22,
    maxWords: 3
  },
  MEDIUM: {
    spawnInterval: 3000,
    fallSpeed: 1.2,
    maxWords: 4
  },
  HARD: {
    spawnInterval: 2500,
    fallSpeed: 1.6,
    maxWords: 5
  }
};

export const WORD_SPAWN_INTERVAL_BASE = 3500; // milliseconds
export const FALL_SPEED_BASE = 0.8; // pixels per frame
export const BASE_MAX_ACTIVE_WORDS = 3; // Starting max words
export const MAX_WORDS_PER_LEVEL = 5; // Maximum possible words at any level
export const INITIAL_LIVES = 3;
export const SCORE_MULTIPLIER = 10;
export const LEVEL_UP_SCORE = 500;
export const MIN_SPAWN_INTERVAL = 1000;

// This will be populated dynamically from the database
export let WORD_PAIRS: WordPair[] = [];

export const updateWordPairs = (newPairs: WordPair[]) => {
  WORD_PAIRS = newPairs;
};

export const calculateGameParams = (level: number, difficulty: keyof typeof LEVELS = 'MEDIUM') => {
  const preset = LEVELS[difficulty];
  const levelMultiplier = 1 + (level - 1) * 0.1; // 10% increase per level
  
  return {
    spawnInterval: Math.max(MIN_SPAWN_INTERVAL, preset.spawnInterval / levelMultiplier),
    fallSpeed: preset.fallSpeed * levelMultiplier,
    maxActiveWords: Math.min(MAX_WORDS_PER_LEVEL, 
      Math.floor(preset.maxWords + (level - 1) * 0.5)) // Add 0.5 words per level, rounded down
  };
};
