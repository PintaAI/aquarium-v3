"use client";

import { useCallback, useRef, useState } from "react";
import { GameDifficulty, GameState, Word } from "../types";
import {
  INITIAL_LIVES,
  SCORE_MULTIPLIER,
  WORD_PAIRS,
  calculateGameParams
} from "../constants";

export const useWordGame = () => {
  // Game state
  const [state, setState] = useState<GameState>({
    score: 0,
    lives: INITIAL_LIVES,
    gameOver: false,
    paused: false,
    level: 1,
    activeWords: [],
    currentInput: "",
    targetWordIndex: null,
    gameStarted: false,
    difficulty: 'MEDIUM'
  });

  // Refs
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Start game
  const startGame = useCallback((difficulty: GameDifficulty) => {
    setState(() => ({
      score: 0,
      lives: INITIAL_LIVES,
      gameOver: false,
      paused: false,
      level: 1,
      activeWords: [],
      currentInput: "",
      targetWordIndex: null,
      gameStarted: true,
      difficulty
    }));
    inputRef.current?.focus();
  }, []);

  // Reset input
  const resetInput = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentInput: "",
      targetWordIndex: null,
      activeWords: prev.activeWords.map(word => ({
        ...word,
        highlighted: false
      }))
    }));
  }, []);

  // Change difficulty
  const changeDifficulty = useCallback((difficulty: GameDifficulty) => {
    setState(prev => ({
      ...prev,
      difficulty
    }));
  }, []);

  // Spawn word
  const spawnWord = useCallback(() => {
    if (state.gameOver || !state.gameStarted || state.paused) return;

    setState(prev => {
      const { maxActiveWords } = calculateGameParams(prev.level, prev.difficulty);
      if (prev.activeWords.length >= maxActiveWords) return prev;

      const gameArea = gameAreaRef.current;
      if (!gameArea) return prev;

      const randomPair = WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)];
      const wordWidth = randomPair.korean.length * 20 + 40;
      const maxX = gameArea.offsetWidth - wordWidth;

      const newWord: Word = {
        id: Date.now(),
        korean: randomPair.korean,
        english: randomPair.english,
        x: Math.random() * maxX,
        y: 0,
        highlighted: false,
      };

      return {
        ...prev,
        activeWords: [...prev.activeWords, newWord]
      };
    });
  }, [state.gameOver, state.gameStarted, state.paused]);

  // Update game animation
  const updateGame = useCallback(() => {
    if (state.gameOver || !state.gameStarted || state.paused) {
      frameRef.current = requestAnimationFrame(updateGame);
      return;
    }

    const { fallSpeed } = calculateGameParams(state.level, state.difficulty);

    setState(prev => {
      const updatedWords = prev.activeWords.map(word => ({
        ...word,
        y: word.y + fallSpeed
      }));

      const gameArea = gameAreaRef.current;
      if (!gameArea) return prev;

      const bottomWords = updatedWords.filter(word => word.y > gameArea.offsetHeight);
      
      if (bottomWords.length > 0) {
        const newLives = prev.lives - bottomWords.length;
        const gameOver = newLives <= 0;
        
        // Reset input when word hits bottom
        resetInput();

        return {
          ...prev,
          lives: Math.max(0, newLives),
          gameOver,
          activeWords: gameOver ? [] : updatedWords.filter(word => word.y <= gameArea.offsetHeight)
        };
      }

      return {
        ...prev,
        activeWords: updatedWords
      };
    });

    frameRef.current = requestAnimationFrame(updateGame);
  }, [state.gameOver, state.gameStarted, state.paused, state.level, state.difficulty]);

  // Handle keyboard input
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (state.gameOver || !state.gameStarted || state.paused) return;

    if (e.key === "Escape") {
      resetInput();
      return;
    }

    if (state.targetWordIndex === null) {
      const index = state.activeWords.findIndex(word =>
        word.english.toLowerCase().startsWith(e.key.toLowerCase())
      );

      if (index !== -1) {
        setState(prev => ({
          ...prev,
          targetWordIndex: index,
          currentInput: e.key,
          activeWords: prev.activeWords.map((word, idx) => ({
            ...word,
            highlighted: idx === index
          }))
        }));
      }
    } else {
      const targetWord = state.activeWords[state.targetWordIndex].english;
      const newInput = state.currentInput + e.key;

      if (targetWord.toLowerCase().startsWith(newInput.toLowerCase())) {
        setState(prev => {
          const wordComplete = newInput.length === targetWord.length;
          const newScore = prev.score + (wordComplete ? targetWord.length * SCORE_MULTIPLIER : 0);
          const newLevel = Math.floor(newScore / 300) + 1;

          // Add shake animation
          const updatedWords = prev.activeWords.map((word, idx) => {
            if (idx === prev.targetWordIndex) {
              return { ...word, shake: true };
            }
            return word;
          });

          // Remove shake after animation
          setTimeout(() => {
            setState(current => ({
              ...current,
              activeWords: current.activeWords.map((word, idx) => {
                if (idx === prev.targetWordIndex) {
                  return { ...word, shake: false };
                }
                return word;
              })
            }));
          }, 200);

          return {
            ...prev,
            currentInput: wordComplete ? "" : newInput,
            targetWordIndex: wordComplete ? null : prev.targetWordIndex,
            score: newScore,
            level: newLevel,
            activeWords: wordComplete
              ? prev.activeWords.filter((_, idx) => idx !== prev.targetWordIndex)
              : updatedWords
          };
        });
      }
    }
  }, [state, resetInput]);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (state.gameOver || !state.gameStarted || state.paused) return;

    const value = e.target.value;
    
    if (state.targetWordIndex !== null) {
      const targetWord = state.activeWords[state.targetWordIndex].english;
      
      if (targetWord.toLowerCase().startsWith(value.toLowerCase())) {
        setState(prev => {
          const wordComplete = value.length === targetWord.length;
          const newScore = prev.score + (wordComplete ? targetWord.length * SCORE_MULTIPLIER : 0);
          const newLevel = Math.floor(newScore / 300) + 1; // Level up every 300 points

          return {
            ...prev,
            currentInput: wordComplete ? "" : value,
            targetWordIndex: wordComplete ? null : prev.targetWordIndex,
            score: newScore,
            level: newLevel,
            activeWords: wordComplete
              ? prev.activeWords.filter((_, idx) => idx !== prev.targetWordIndex)
              : prev.activeWords
          };
        });

        if (value.length === targetWord.length) {
          e.target.value = "";
        }
      }
    }
  }, [state]);

  // Toggle pause
  const togglePause = useCallback(() => {
    setState(prev => ({
      ...prev,
      paused: !prev.paused
    }));
  }, []);

  return {
    state,
    refs: Object.freeze({
      gameAreaRef,
      frameRef,
      inputRef
    }),
    actions: {
      startGame,
      resetInput,
      spawnWord,
      updateGame,
      handleKeyDown,
      handleInputChange,
      togglePause,
      changeDifficulty
    }
  };
};
