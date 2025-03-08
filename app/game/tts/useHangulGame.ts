import { useState, useCallback } from 'react';
import { GridCell, WordCell, PlacedWord, Direction, Level } from './types';
import {
  MIN_WORD_LENGTH,
  WORDS_TO_PLACE_PER_LEVEL,
  HINT_COOLDOWN_MS,
  POINTS_PER_CHAR,
  COMMON_SYLLABLES,
  KOREAN_DICTIONARY,
  DIRECTIONS,
  LEVELS
} from './constants';

interface UseHangulGameProps {
  level: Level;
}

export function useHangulGame({ level }: UseHangulGameProps) {
  const [grid, setGrid] = useState<GridCell[][]>([]);
  const [selectedCells, setSelectedCells] = useState<WordCell[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [currentWord, setCurrentWord] = useState('');
  const [message, setMessage] = useState('Cari kosa kata Bahasa Korea!');
  const [score, setScore] = useState(0);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [hintCells, setHintCells] = useState<WordCell[]>([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintCooldown, setHintCooldown] = useState(false);
  const [placedWords, setPlacedWords] = useState<PlacedWord[]>([]);

  // Create game board with pre-placed words
  const createBoard = useCallback(() => {
    const gridSize = level.gridSize;
    const newGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
    const placedWordsList: PlacedWord[] = [];

    // Helper to check if a position is valid for word placement
    const isPositionValid = (row: number, col: number, length: number, direction: Direction) => {
      const [dr, dc] = direction;
      
      // Check if the word fits on the board
      const endRow = row + (length - 1) * dr;
      const endCol = col + (length - 1) * dc;
      
      if (endRow < 0 || endRow >= gridSize || endCol < 0 || endCol >= gridSize) {
        return false;
      }
      
      // Check if any cell in the path is already filled
      for (let i = 0; i < length; i++) {
        const r = row + i * dr;
        const c = col + i * dc;
        if (newGrid[r][c] !== null) {
          return false;
        }
      }
      
      return true;
    };

    // Try to place each word from the dictionary
    const wordsToPlace = [...KOREAN_DICTIONARY]
      .sort(() => 0.5 - Math.random())
      .slice(0, WORDS_TO_PLACE_PER_LEVEL[level.id as keyof typeof WORDS_TO_PLACE_PER_LEVEL]);
    
    for (const word of wordsToPlace) {
      let placed = false;
      
      // Try 50 random positions
      for (let attempt = 0; attempt < 50 && !placed; attempt++) {
        const row = Math.floor(Math.random() * gridSize);
        const col = Math.floor(Math.random() * gridSize);
        const direction = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
        
        if (isPositionValid(row, col, word.length, direction)) {
          // Place the word
          const [dr, dc] = direction;
          const cells: WordCell[] = [];
          
          for (let i = 0; i < word.length; i++) {
            const r = row + i * dr;
            const c = col + i * dc;
            newGrid[r][c] = word[i];
            cells.push({ row: r, col: c });
          }
          
          placed = true;
          placedWordsList.push({ word, cells });
        }
      }
    }
    
    // Fill remaining cells with random syllables
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (newGrid[i][j] === null) {
          newGrid[i][j] = COMMON_SYLLABLES[Math.floor(Math.random() * COMMON_SYLLABLES.length)];
        }
      }
    }
    
    // Convert grid format to include all cell properties
    const finalGrid = newGrid.map((row, i) => 
      row.map((char, j) => ({
        char,
        selected: false,
        used: false,
        hint: false,
        row: i,
        col: j
      }))
    );
    
    return { finalGrid, placedWordsList };
  }, [level]);

  // Check if a move is valid (adjacent to the last selected cell)
  const isValidMove = useCallback((lastCell: WordCell | null, currentCell: WordCell) => {
    if (!lastCell) return true;
    
    // Only allow horizontal or vertical moves (not diagonal)
    const rowDiff = Math.abs(lastCell.row - currentCell.row);
    const colDiff = Math.abs(lastCell.col - currentCell.col);
    
    // Either row or column must be the same (not both different)
    return (rowDiff === 0 && colDiff === 1) || (colDiff === 0 && rowDiff === 1);
  }, []);

  // Check if cells form a straight line (horizontal or vertical only)
  const formsLine = useCallback((cells: WordCell[]) => {
    if (cells.length <= 2) return true;
    
    // Check if all cells are in the same row (horizontal line)
    const sameRow = cells.every(cell => cell.row === cells[0].row);
    if (sameRow) return true;
    
    // Check if all cells are in the same column (vertical line)
    const sameCol = cells.every(cell => cell.col === cells[0].col);
    if (sameCol) return true;
    
    // If neither in same row nor same column, it's not a valid line
    return false;
  }, []);

  // Clear hint highlights
  const clearHints = useCallback(() => {
    if (hintCells.length > 0) {
      const newGrid = [...grid];
      hintCells.forEach(cell => {
        newGrid[cell.row][cell.col] = { 
          ...newGrid[cell.row][cell.col], 
          hint: false
        };
      });
      setGrid(newGrid);
      setHintCells([]);
    }
  }, [grid, hintCells]);

  // Handle cell selection start
  const handleMouseDown = useCallback((row: number, col: number) => {
    if (grid[row][col].used) return;
    
    clearHints();
    
    setIsSelecting(true);
    const newSelectedCells = [{ row, col }];
    setSelectedCells(newSelectedCells);
    
    const newGrid = [...grid];
    newGrid[row][col] = { ...newGrid[row][col], selected: true };
    setGrid(newGrid);
    
    setCurrentWord(newGrid[row][col].char);
  }, [grid, clearHints]);

  // Handle movement over cells
  const handleMouseEnter = useCallback((row: number, col: number) => {
    if (!isSelecting || grid[row][col].used) return;
    
    const lastCell = selectedCells.length > 0 ? selectedCells[selectedCells.length - 1] : null;
    const currentCell = { row, col };
    
    if (isValidMove(lastCell, currentCell) && 
        !selectedCells.some(cell => cell.row === row && cell.col === col) &&
        formsLine([...selectedCells, currentCell])) {
      
      const newSelectedCells = [...selectedCells, { row, col }];
      setSelectedCells(newSelectedCells);
      
      const newGrid = [...grid];
      newGrid[row][col] = { ...newGrid[row][col], selected: true };
      setGrid(newGrid);
      
      setCurrentWord(prev => prev + newGrid[row][col].char);
    }
  }, [grid, isSelecting, selectedCells, isValidMove, formsLine]);

  // Handle selection end
  const handleMouseUp = useCallback(() => {
    setIsSelecting(false);
    
    // Allow single character selection for 1-character words
    if (selectedCells.length >= 1) {
      if (KOREAN_DICTIONARY.includes(currentWord)) {
        setMessage(`Word found: ${currentWord}!`);
        setScore(prev => prev + currentWord.length * POINTS_PER_CHAR);
        setFoundWords(prev => [...prev, currentWord]);
        
        const newGrid = [...grid];
        selectedCells.forEach(cell => {
          newGrid[cell.row][cell.col] = { 
            ...newGrid[cell.row][cell.col], 
            used: true,
            selected: false
          };
        });
        setGrid(newGrid);
      } else {
        // Word not in dictionary
        if (selectedCells.length === 1) {
          setMessage(`'${currentWord}' Bukan kata yang valid!`);
        } else {
          setMessage(`'${currentWord}' Bukan kata yang valid!`);
        }
        
        const newGrid = [...grid];
        selectedCells.forEach(cell => {
          newGrid[cell.row][cell.col] = { 
            ...newGrid[cell.row][cell.col], 
            selected: false
          };
        });
        setGrid(newGrid);
      }
    } else {
      const newGrid = [...grid];
      selectedCells.forEach(cell => {
        newGrid[cell.row][cell.col] = { 
          ...newGrid[cell.row][cell.col], 
          selected: false
        };
      });
      setGrid(newGrid);
    }
    
    setCurrentWord('');
    setSelectedCells([]);
  }, [grid, selectedCells, currentWord]);

  // Give a hint
  const giveHint = useCallback(() => {
    clearHints();
    
    setHintsUsed(prev => prev + 1);
    
    setHintCooldown(true);
    setTimeout(() => {
      setHintCooldown(false);
    }, HINT_COOLDOWN_MS);
    
    const availableWords = placedWords.filter(
      item => !foundWords.includes(item.word) && 
      !item.cells.some(cell => grid[cell.row][cell.col].used)
    );
    
    if (availableWords.length > 0) {
      const hintWord = availableWords[Math.floor(Math.random() * availableWords.length)];
      
      const newGrid = [...grid];
      hintWord.cells.forEach(cell => {
        newGrid[cell.row][cell.col] = { 
          ...newGrid[cell.row][cell.col], 
          hint: true
        };
      });
      setGrid(newGrid);
      setHintCells(hintWord.cells);
      
      setMessage(`Hint: Found a ${hintWord.word.length}-letter word!`);
    } else {
      setMessage("Semua kata sudah di temukan! New game");
    }
  }, [grid, placedWords, foundWords, clearHints]);

  // Reset the game
  const resetGame = useCallback(() => {
    const { finalGrid, placedWordsList } = createBoard();
    setGrid(finalGrid);
    setPlacedWords(placedWordsList);
    setSelectedCells([]);
    setCurrentWord('');
    setMessage('Cari kosa kata Bahasa Korea!');
    setScore(0);
    setFoundWords([]);
    setHintCells([]);
    setHintsUsed(0);
    setHintCooldown(false);
  }, [createBoard]);

  return {
    // State
    grid,
    score,
    foundWords,
    placedWords,
    message,
    hintCooldown,
    
    // Actions
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
    giveHint,
    resetGame,
    
    // Initialize
    createBoard
  };
}
