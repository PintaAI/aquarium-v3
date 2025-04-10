import { useState, useEffect, useCallback, useRef } from 'react';
import { HangulCharacter, getCharactersByDifficulty } from '../data/hangulData';
import confetti from 'canvas-confetti';

export type GameDifficulty = 'easy' | 'medium' | 'hard' | 'all';
export type GameMode = 'quiz' | 'learning';

interface GameSettings {
  totalQuestions: number;
  timePerQuestion: number;
  difficultyLevel: GameDifficulty;
  gameMode: GameMode;
}

interface GameState {
  currentChar: HangulCharacter | null;
  options: string[];
  feedback: string;
  score: number;
  questionNumber: number;
  timeLeft: number;
  gameOver: boolean;
  streak: number;
  highScore: number;
  correctAnswers: number;
  incorrectAnswers: number;
  isCorrect: boolean | null;
  remainingTime: number;
}

const DEFAULT_SETTINGS: GameSettings = {
  totalQuestions: 10,
  timePerQuestion: 10,
  difficultyLevel: 'easy',
  gameMode: 'quiz',
};

// Use local storage to persist high score
const getStoredHighScore = (): number => {
  if (typeof window === 'undefined') return 0;
  const storedScore = localStorage.getItem('hangulHighScore');
  return storedScore ? parseInt(storedScore, 10) : 0;
};

const setStoredHighScore = (score: number): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('hangulHighScore', score.toString());
};

export const useHangulGame = (initialSettings?: Partial<GameSettings>) => {
  // Manage settings with useState
  const [settings, setSettings] = useState<GameSettings>({
    ...DEFAULT_SETTINGS,
    ...initialSettings,
  });

  const [characters, setCharacters] = useState<HangulCharacter[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    currentChar: null,
    options: [],
    feedback: '',
    score: 0,
    questionNumber: 1,
    timeLeft: settings.timePerQuestion,
    gameOver: false,
    streak: 0,
    highScore: getStoredHighScore(),
    correctAnswers: 0,
    incorrectAnswers: 0,
    isCorrect: null,
    remainingTime: 100,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Function to update settings
  const updateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    // Note: startGame is called separately in the component after updating settings
  }, []);

  const shuffleArray = useCallback((array: string[]) => {
    return [...array].sort(() => Math.random() - 0.5);
  }, []);

  // Initialize or update the character set when difficulty changes
  useEffect(() => {
    const newCharacters = getCharactersByDifficulty(settings.difficultyLevel);
    setCharacters(newCharacters);
  }, [settings.difficultyLevel]); // Depends on settings state

  // Generate a new question
  const generateQuestion = useCallback(() => {
    if (characters.length === 0) return;
    
    const randomChar = characters[Math.floor(Math.random() * characters.length)];
    
    const tempOptions = new Set<string>();
    tempOptions.add(randomChar.pronunciation);
    
    while (tempOptions.size < 4) {
      const randomOption = characters[Math.floor(Math.random() * characters.length)].pronunciation;
      tempOptions.add(randomOption);
    }
    
    setGameState(prev => ({
      ...prev,
      currentChar: randomChar,
      options: shuffleArray(Array.from(tempOptions)),
      feedback: '',
      timeLeft: settings.timePerQuestion,
      isCorrect: null,
      remainingTime: 100,
    }));
  }, [characters, settings.timePerQuestion, shuffleArray]); // Keep dependencies here

  // Start or restart the game - ONLY resets state, doesn't generate question directly
  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      // Reset core game state, keep high score
      score: 0,
      questionNumber: 1,
      gameOver: false,
      streak: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      isCorrect: null,
      feedback: '', // Clear feedback on restart
      timeLeft: settings.timePerQuestion, // Reset timer based on current settings
      remainingTime: 100, // Reset progress bar
    }));
    // Character loading and question generation are handled by effects now
  }, [settings.timePerQuestion]); // Depends only on settings needed for reset

  // Effect to generate a question when characters load or question number changes
  useEffect(() => {
    // Only generate if game is not over and characters are loaded
    if (!gameState.gameOver && characters.length > 0) {
      generateQuestion();
    }
    // Clear timer if game ends while this effect is pending
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [characters, gameState.questionNumber, gameState.gameOver, generateQuestion]); // Trigger on these changes

  // Move to the next question or end the game
  const handleNextQuestion = useCallback(() => {
    if (gameState.questionNumber < settings.totalQuestions) {
      setGameState(prev => ({
        ...prev,
        questionNumber: prev.questionNumber + 1,
        feedback: '',
      }));
      generateQuestion();
    } else {
      setGameState(prev => ({
        ...prev,
        gameOver: true,
      }));
      
      // Trigger confetti for game completion
      triggerConfetti();
    }
  }, [gameState.questionNumber, settings.totalQuestions, generateQuestion]);

  // Process when an option is clicked
  const handleOptionClick = useCallback((option: string, index: number) => {
    if (gameState.gameOver || !gameState.currentChar) return;
    
    // Blur the button to prevent focus styles
    if (buttonRefs.current[index]) {
      buttonRefs.current[index]?.blur();
    }
    
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    const isCorrect = option === gameState.currentChar.pronunciation;
    const feedback = isCorrect 
      ? 'Benar!'
      : `Salah! Jawaban yang benar adalah ${gameState.currentChar.pronunciation}.`;
    
    setGameState(prev => ({
      ...prev,
      feedback,
      score: isCorrect ? prev.score + 1 : prev.score,
      streak: isCorrect ? prev.streak + 1 : 0,
      isCorrect,
      correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
      incorrectAnswers: !isCorrect ? prev.incorrectAnswers + 1 : prev.incorrectAnswers,
    }));
    
    // Update high score if needed
    if (isCorrect && gameState.score + 1 > gameState.highScore) {
      const newHighScore = gameState.score + 1;
      setGameState(prev => ({ ...prev, highScore: newHighScore }));
      setStoredHighScore(newHighScore);
    }
    
    // Automatic progression after feedback duration
    setTimeout(() => {
      handleNextQuestion();
    }, 1500);
  }, [gameState.currentChar?.pronunciation, gameState.score, gameState.highScore, handleNextQuestion]); // Refined dependencies

  // Timer effect
  useEffect(() => {
    if (gameState.gameOver || gameState.feedback || !gameState.currentChar) return;
    
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    const timerInterval = 100; // Update every 100ms for smoother progress
    const totalTimeMs = settings.timePerQuestion * 1000;
    const decrementPerInterval = (timerInterval / totalTimeMs) * 100;
    
    timerRef.current = setInterval(() => {
      setGameState(prev => {
        // If time has run out
        if (prev.remainingTime <= decrementPerInterval) {
          clearInterval(timerRef.current!);
          
          // Set timeout to move to next question after showing feedback
          setTimeout(() => {
            handleNextQuestion();
          }, 1500);
          
          return {
            ...prev,
            feedback: `Waktu habis! Jawaban yang benar adalah ${prev.currentChar?.pronunciation}.`,
            remainingTime: 0,
            isCorrect: false,
            incorrectAnswers: prev.incorrectAnswers + 1,
          };
        }
        
        // Otherwise, decrement the time
        return {
          ...prev,
          remainingTime: prev.remainingTime - decrementPerInterval,
          timeLeft: Math.ceil((prev.remainingTime - decrementPerInterval) * settings.timePerQuestion / 100),
        };
      });
    }, timerInterval);
    
    // Clean up timer on component unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState.gameOver, gameState.feedback, gameState.currentChar, settings.timePerQuestion, handleNextQuestion]);

  // Effect to initialize the game state on mount (or when startGame identity changes - should be stable now)
  useEffect(() => {
    startGame(); // Just resets the state

    // Clean up function
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [startGame]);
  
  // Function to trigger confetti animation
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return {
    gameState,
    buttonRefs,
    handleOptionClick,
    startGame,
    settings, // Return current settings state
    updateSettings, // Return the update function
  };
};
