import { Level } from './types';

export const LEVELS: Level[] = [
  {
    id: 'easy',
    name: 'Easy',
    gridSize: 8,
    description: 'untuk pemula '
  },
  {
    id: 'medium',
    name: 'Medium',
    gridSize: 12,
    description: 'untuk menengah '
  },
  {
    id: 'hard',
    name: 'Hard',
    gridSize: 16,
    description: 'unruk mahir '
  }
];

// Game configuration
export const MIN_WORD_LENGTH = 2;
export const WORDS_TO_PLACE_PER_LEVEL = {
  easy: 10,
  medium: 15,
  hard: 20
};
export const HINT_COOLDOWN_MS = 5000;
export const POINTS_PER_CHAR = 10;

// Common Korean syllables for filling empty cells
export const COMMON_SYLLABLES = [
  '가', '나', '다', '라', '마', '바', '사', '아', '자', '하',
  '거', '너', '더', '러', '머', '서', '어', '저', '허',
  '고', '노', '도', '로', '모', '보', '소', '오', '조', '호',
  '구', '누', '두', '루', '무', '수', '우', '주', '후',
  '기', '니', '디', '리', '미', '비', '시', '이', '지', '히'
];

// Korean dictionary for valid words
export const KOREAN_DICTIONARY = [
  '나무', '사람', '학교', '한국', '음식', '친구', '가족', '시간', '사랑', '여행',
  '도시', '공부', '책상', '의자', '컴퓨터', '전화', '물', '바다', '하늘', '땅',
  '달', '해', '별', '꽃', '산', '눈', '비', '차', '집', '길', 
  '학생', '선생', '가방', '연필', '종이', '창문', '문화', '역사', '과학', '미술',
  '음악', '운동', '건강', '병원', '의사', '약국', '약사', '경찰', '소방', '군인'
];

// Valid directions for word placement and line drawing - only horizontal and vertical
export const DIRECTIONS: [number, number][] = [
  [0, 1],  // right
  [1, 0]   // down
];
