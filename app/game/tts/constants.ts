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

// Korean words with their meanings
export interface KoreanWord {
  word: string;
  meaning: string;
}

export const KOREAN_DICTIONARY: KoreanWord[] = [
  { word: '나무', meaning: 'Pohon' },
  { word: '사람', meaning: 'Orang' },
  { word: '학교', meaning: 'Sekolah' },
  { word: '한국', meaning: 'Korea' },
  { word: '음식', meaning: 'Makanan' },
  { word: '친구', meaning: 'Teman' },
  { word: '가족', meaning: 'Keluarga' },
  { word: '시간', meaning: 'Waktu' },
  { word: '사랑', meaning: 'Cinta' },
  { word: '여행', meaning: 'Perjalanan' },
  { word: '도시', meaning: 'Kota' },
  { word: '공부', meaning: 'Belajar' },
  { word: '책상', meaning: 'Meja' },
  { word: '의자', meaning: 'Kursi' },
  { word: '컴퓨터', meaning: 'Komputer' },
  { word: '전화', meaning: 'Telepon' },
  { word: '물', meaning: 'Air' },
  { word: '바다', meaning: 'Laut' },
  { word: '하늘', meaning: 'Langit' },
  { word: '땅', meaning: 'Tanah' },
  { word: '달', meaning: 'Bulan' },
  { word: '해', meaning: 'Matahari' },
  { word: '별', meaning: 'Bintang' },
  { word: '꽃', meaning: 'Bunga' },
  { word: '산', meaning: 'Gunung' },
  { word: '눈', meaning: 'Salju/mata' },
  { word: '비', meaning: 'Hujan' },
  { word: '차', meaning: 'Mobil/teh' },
  { word: '집', meaning: 'Rumah' },
  { word: '길', meaning: 'Jalan' },
  { word: '학생', meaning: 'Murid' },
  { word: '선생', meaning: 'Guru' },
  { word: '가방', meaning: 'Tas' },
  { word: '연필', meaning: 'Pensil' },
  { word: '종이', meaning: 'Kertas' },
  { word: '창문', meaning: 'Jendela' },
  { word: '문화', meaning: 'Budaya' },
  { word: '역사', meaning: 'Sejarah' },
  { word: '과학', meaning: 'Sains' },
  { word: '미술', meaning: 'Seni' },
  { word: '음악', meaning: 'Musik' },
  { word: '운동', meaning: 'Olahraga' },
  { word: '건강', meaning: 'Kesehatan' },
  { word: '병원', meaning: 'Rumah sakit' },
  { word: '의사', meaning: 'Dokter' },
  { word: '약국', meaning: 'Apotek' },
  { word: '약사', meaning: 'Apoteker' },
  { word: '경찰', meaning: 'Polisi' },
  { word: '소방', meaning: 'Pemadam kebakaran' },
  { word: '군인', meaning: 'Tentara' }
];

// Valid directions for word placement and line drawing - only horizontal and vertical
export const DIRECTIONS: [number, number][] = [
  [0, 1],  // right
  [1, 0]   // down
];
