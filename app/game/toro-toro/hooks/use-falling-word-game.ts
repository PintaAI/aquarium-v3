import { useState, useEffect, useCallback } from 'react';
import { PRESET_LISTS, PresetListType } from '../data/word-lists';

interface Word {
  id: number;
  term: string;
  definition: string;
}

interface WordWithPosition extends Word {
  positionX: number;
  positionY: number;
  speed: number;
}

interface DictionaryResult {
  term: string;
  definition: string;
}

export type Difficulty = 'easy' | 'normal' | 'hard';

const DIFFICULTY_SETTINGS = {
  easy: {
    maxWords: 3,
    spawnInterval: 4000,
    baseSpeed: 0.3,
    maxSpeed: 0.8,
    scoreMultiplier: 1
  },
  normal: {
    maxWords: 5,
    spawnInterval: 3000,
    baseSpeed: 0.5,
    maxSpeed: 1.5,
    scoreMultiplier: 2
  },
  hard: {
    maxWords: 7,
    spawnInterval: 2000,
    baseSpeed: 0.8,
    maxSpeed: 2.0,
    scoreMultiplier: 3
  }
};

interface GameState {
  fallingWords: WordWithPosition[];
  userInput: string;
  timer: number;
  gameOver: boolean;
  score: number;
  gameStarted: boolean;
  customWords: Word[];
  isUsingCustomWords: boolean;
  dialogOpen: boolean;
  dictionarySearch: string;
  searchResults: DictionaryResult[];
  isSearching: boolean;
  gameAreaHeight: number;
  difficulty: Difficulty;
  selectedWordList: PresetListType;
}

export function useFallingWordGame() {
  const [state, setState] = useState<GameState>({
    fallingWords: [],
    userInput: '',
    timer: 120,
    gameOver: false,
    score: 0,
    gameStarted: false,
    customWords: [],
    isUsingCustomWords: false,
    dialogOpen: false,
    dictionarySearch: '',
    searchResults: [],
    isSearching: false,
    gameAreaHeight: 0,
    difficulty: 'normal',
    selectedWordList: 'basic'
  });

  const getWordList = () => state.isUsingCustomWords ? state.customWords : PRESET_LISTS[state.selectedWordList].words;

  const setGameAreaHeight = (height: number) => {
    setState(prev => ({ ...prev, gameAreaHeight: height }));
  };

  const searchDictionary = async (query: string) => {
    if (!query.trim()) return;
    
    setState(prev => ({ ...prev, isSearching: true }));
    try {
      const response = await fetch(`/api/korean-dictionary?q=${encodeURIComponent(query)}`);
      const xmlText = await response.text();
      
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      
      const items = xmlDoc.getElementsByTagName('item');
      const results: DictionaryResult[] = [];
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const term = item.getElementsByTagName('word')[0]?.textContent || '';
        const definition = item.getElementsByTagName('trans_word')[0]?.textContent || '';
        
        if (term && definition) {
          results.push({ term, definition });
        }
      }
      
      setState(prev => ({ ...prev, searchResults: results }));
    } catch (error) {
      console.error('Error searching dictionary:', error);
    } finally {
      setState(prev => ({ ...prev, isSearching: false }));
    }
  };

  const startGame = () => {
    if (state.isUsingCustomWords && state.customWords.length === 0) return;
    
    setState(prev => ({
      ...prev,
      gameStarted: true,
      gameOver: false,
      score: 0,
      timer: 120,
      fallingWords: [],
      userInput: '',
      dialogOpen: false
    }));
  };

  const handleInputChange = (value: string) => {
    setState(prev => ({ ...prev, userInput: value }));

    const matchedWord = state.fallingWords.find(
      word => value.trim().toLowerCase() === word.definition.trim().toLowerCase()
    );

    if (matchedWord) {
      // Play the sound
      const audio = new Audio('/sound/benar.mp3');
      audio.play();

      setState(prev => ({
        ...prev,
        score: prev.score + (1 * DIFFICULTY_SETTINGS[prev.difficulty].scoreMultiplier),
        fallingWords: prev.fallingWords.filter(w => w.id !== matchedWord.id),
        userInput: ''
      }));
    }
  };

  const setDifficulty = (difficulty: Difficulty) => {
    if (!state.gameStarted) {
      setState(prev => ({ ...prev, difficulty }));
    }
  };

  const setSelectedWordList = (wordList: PresetListType) => {
    if (!state.gameStarted) {
      setState(prev => ({ ...prev, selectedWordList: wordList }));
    }
  };

  const addCustomWord = (term: string, definition: string) => {
    if (term.trim() && definition.trim()) {
      setState(prev => ({
        ...prev,
        customWords: [
          ...prev.customWords,
          {
            id: Date.now(),
            term: term.trim(),
            definition: definition.trim()
          }
        ]
      }));
    }
  };

  const addFromDictionary = (result: DictionaryResult) => {
    setState(prev => ({
      ...prev,
      customWords: [
        ...prev.customWords,
        {
          id: Date.now(),
          term: result.term,
          definition: result.definition
        }
      ]
    }));
  };

  const removeCustomWord = (id: number) => {
    setState(prev => ({
      ...prev,
      customWords: prev.customWords.filter(word => word.id !== id)
    }));
  };

  const setDialogOpen = (open: boolean) => {
    setState(prev => ({ ...prev, dialogOpen: open }));
  };

  const setDictionarySearch = (search: string) => {
    setState(prev => ({ ...prev, dictionarySearch: search }));
  };

  const setIsUsingCustomWords = (using: boolean) => {
    setState(prev => ({ ...prev, isUsingCustomWords: using }));
  };

  // Add new words based on difficulty settings
  useEffect(() => {
    if (!state.gameStarted || state.gameOver) return;

    const settings = DIFFICULTY_SETTINGS[state.difficulty];
    const wordList = getWordList();

    const spawnInterval = setInterval(() => {
      setState(prev => {
        if (prev.fallingWords.length >= settings.maxWords) {
          return prev;
        }

        const unusedWords = wordList.filter(word => 
          !prev.fallingWords.some(falling => falling.id === word.id)
        );
        
        if (unusedWords.length === 0) {
          return prev;
        }

        const randomWord = unusedWords[Math.floor(Math.random() * unusedWords.length)];
        const positionX = Math.floor(Math.random() * (80 - 20 + 1) + 20);
        const speed = Math.random() * (settings.maxSpeed - settings.baseSpeed) + settings.baseSpeed;
        
        const newWord = { 
          ...randomWord, 
          positionX, 
          positionY: 0, 
          speed 
        };

        return {
          ...prev,
          fallingWords: [...prev.fallingWords, newWord]
        };
      });
    }, settings.spawnInterval);

    return () => clearInterval(spawnInterval);
  }, [state.gameStarted, state.gameOver, state.difficulty]);

  // Move words down and check for ground collision
  useEffect(() => {
    if (!state.gameStarted || state.gameOver || !state.gameAreaHeight) return;

    const groundLevel = state.gameAreaHeight - 50;

    const moveWordsInterval = setInterval(() => {
      setState(prev => {
        const updatedWords = prev.fallingWords.map(word => ({
          ...word,
          positionY: word.positionY + word.speed
        }));

        const hasWordHitGround = updatedWords.some(word => word.positionY >= groundLevel);

        if (hasWordHitGround) {
          return {
            ...prev,
            gameOver: true,
            gameStarted: false,
            fallingWords: []
          };
        }

        return {
          ...prev,
          fallingWords: updatedWords
        };
      });
    }, 50);

    return () => clearInterval(moveWordsInterval);
  }, [state.gameStarted, state.gameOver, state.gameAreaHeight]);

  // Game timer
  useEffect(() => {
    if (!state.gameStarted || state.gameOver) return;

    const countdown = setInterval(() => {
      setState(prev => {
        if (prev.timer <= 1) {
          return {
            ...prev,
            gameOver: true,
            gameStarted: false,
            timer: 0
          };
        }
        return {
          ...prev,
          timer: prev.timer - 1
        };
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [state.gameStarted, state.gameOver]);

  return {
    state,
    presetWordLists: PRESET_LISTS,
    actions: {
      startGame,
      handleInputChange,
      addCustomWord,
      addFromDictionary,
      removeCustomWord,
      setDialogOpen,
      setDictionarySearch,
      setIsUsingCustomWords,
      searchDictionary,
      setGameAreaHeight,
      setDifficulty,
      setSelectedWordList
    }
  };
}
