export interface HangulCharacter {
  character: string;
  pronunciation: string;
  type: 'consonant' | 'vowel' | 'complex-vowel';
  difficulty: 'easy' | 'medium' | 'hard';
  description?: string;
}

// All Hangul characters with their pronunciation, type, and difficulty level
export const hangulCharacters: HangulCharacter[] = [
  // Consonants (Konsonan)
  { character: 'ㄱ', pronunciation: 'G', type: 'consonant', difficulty: 'easy', description: 'Similar to "g" in "go"' },
  { character: 'ㄴ', pronunciation: 'N', type: 'consonant', difficulty: 'easy', description: 'Similar to "n" in "no"' },
  { character: 'ㄷ', pronunciation: 'D', type: 'consonant', difficulty: 'easy', description: 'Similar to "d" in "dog"' },
  { character: 'ㄹ', pronunciation: 'R/L', type: 'consonant', difficulty: 'medium', description: 'Between "r" and "l" sounds' },
  { character: 'ㅁ', pronunciation: 'M', type: 'consonant', difficulty: 'easy', description: 'Similar to "m" in "mom"' },
  { character: 'ㅂ', pronunciation: 'B', type: 'consonant', difficulty: 'easy', description: 'Similar to "b" in "boy"' },
  { character: 'ㅅ', pronunciation: 'S', type: 'consonant', difficulty: 'easy', description: 'Similar to "s" in "see"' },
  { character: 'ㅇ', pronunciation: 'Diam/Ng', type: 'consonant', difficulty: 'medium', description: 'Silent at start, "ng" sound at end' },
  { character: 'ㅈ', pronunciation: 'J', type: 'consonant', difficulty: 'easy', description: 'Similar to "j" in "jump"' },
  { character: 'ㅊ', pronunciation: 'Ch', type: 'consonant', difficulty: 'medium', description: 'Similar to "ch" in "chair"' },
  { character: 'ㅋ', pronunciation: 'K', type: 'consonant', difficulty: 'medium', description: 'Similar to "k" in "kite"' },
  { character: 'ㅌ', pronunciation: 'T', type: 'consonant', difficulty: 'medium', description: 'Similar to "t" in "top"' },
  { character: 'ㅍ', pronunciation: 'P', type: 'consonant', difficulty: 'medium', description: 'Similar to "p" in "pan"' },
  { character: 'ㅎ', pronunciation: 'H', type: 'consonant', difficulty: 'easy', description: 'Similar to "h" in "hat"' },

  // Simple Vowels (Vokal Tunggal)
  { character: 'ㅏ', pronunciation: 'A', type: 'vowel', difficulty: 'easy', description: 'Similar to "a" in "father"' },
  { character: 'ㅑ', pronunciation: 'Ya', type: 'vowel', difficulty: 'medium', description: 'Similar to "ya" in "yacht"' },
  { character: 'ㅓ', pronunciation: 'Eo', type: 'vowel', difficulty: 'easy', description: 'Similar to "eo" in "yeoman"' },
  { character: 'ㅕ', pronunciation: 'Yeo', type: 'vowel', difficulty: 'medium', description: 'Similar to "yo" in "yonder"' },
  { character: 'ㅜ', pronunciation: 'U', type: 'vowel', difficulty: 'easy', description: 'Similar to "oo" in "moon"' },
  { character: 'ㅠ', pronunciation: 'Yu', type: 'vowel', difficulty: 'medium', description: 'Similar to "yu" in "youth"' },
  { character: 'ㅗ', pronunciation: 'O', type: 'vowel', difficulty: 'easy', description: 'Similar to "o" in "open"' },
  { character: 'ㅛ', pronunciation: 'Yo', type: 'vowel', difficulty: 'medium', description: 'Similar to "yo" in "yo-yo"' },
  { character: 'ㅡ', pronunciation: 'Eu', type: 'vowel', difficulty: 'medium', description: 'No English equivalent' },
  { character: 'ㅣ', pronunciation: 'I', type: 'vowel', difficulty: 'easy', description: 'Similar to "ee" in "see"' },

  // Complex Vowels (Vokal Rangkap)
  { character: 'ㅔ', pronunciation: 'E', type: 'complex-vowel', difficulty: 'medium', description: 'Similar to "e" in "set"' },
  { character: 'ㅖ', pronunciation: 'Ye', type: 'complex-vowel', difficulty: 'hard', description: 'Similar to "ye" in "yes"' },
  { character: 'ㅐ', pronunciation: 'Ae', type: 'complex-vowel', difficulty: 'medium', description: 'Similar to "a" in "cat"' },
  { character: 'ㅒ', pronunciation: 'Yae', type: 'complex-vowel', difficulty: 'hard', description: 'Similar to "yae" in "yay"' },
  { character: 'ㅘ', pronunciation: 'Wa', type: 'complex-vowel', difficulty: 'hard', description: 'Similar to "wa" in "water"' },
  { character: 'ㅙ', pronunciation: 'Wae', type: 'complex-vowel', difficulty: 'hard', description: 'Similar to "wae" in "way"' },
  { character: 'ㅚ', pronunciation: 'Oe/We', type: 'complex-vowel', difficulty: 'hard', description: 'Similar to "we" sound' },
  { character: 'ㅝ', pronunciation: 'Weo/Wo', type: 'complex-vowel', difficulty: 'hard', description: 'Similar to "wo" in "won"' },
  { character: 'ㅞ', pronunciation: 'We', type: 'complex-vowel', difficulty: 'hard', description: 'Similar to "we" in "went"' },
  { character: 'ㅟ', pronunciation: 'Wi', type: 'complex-vowel', difficulty: 'hard', description: 'Similar to "we" in "week"' },
  { character: 'ㅢ', pronunciation: 'Ui/Eui', type: 'complex-vowel', difficulty: 'hard', description: 'Similar to "wi" in "win"' }
];

// Filter functions to get characters by difficulty level
export const getCharactersByDifficulty = (difficulty: 'easy' | 'medium' | 'hard' | 'all'): HangulCharacter[] => {
  if (difficulty === 'all') return hangulCharacters;
  return hangulCharacters.filter(char => char.difficulty === difficulty);
};

// Filter functions to get characters by type
export const getCharactersByType = (type: 'consonant' | 'vowel' | 'complex-vowel' | 'all'): HangulCharacter[] => {
  if (type === 'all') return hangulCharacters;
  return hangulCharacters.filter(char => char.type === type);
};
