import React from "react";
import { GameControls } from "./GameControls";
import { FallingWord } from "./FallingWord";
import { GameDifficulty, Word } from "../types";
import { LEVELS } from "../constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface GameOverlayProps {
  score?: number;
  onStart: (difficulty: GameDifficulty) => void;
  difficulty: GameDifficulty;
  onChangeDifficulty: (difficulty: GameDifficulty) => void;
}

const Instructions = () => (
  <div className="mb-6 bg-card/80 p-4 rounded-lg">
    <h3 className="text-lg font-bold mb-2 text-card-foreground">Instructions:</h3>
    <ul className="list-disc pl-5 space-y-1 text-card-foreground/80">
      <li>Type the English translations of the falling Korean words</li>
      <li>Start typing to select a word - it will highlight in yellow</li>
      <li>Complete the word before it reaches the bottom</li>
      <li>Press ESC to deselect a word</li>
      <li>You lose a life for each word that reaches the bottom</li>
    </ul>
  </div>
);

const GameOverlay = ({ score, onStart, difficulty, onChangeDifficulty, isGameOver }: GameOverlayProps & { isGameOver: boolean }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-background/95 text-foreground">
    <div className="text-center max-w-md p-6 bg-card rounded-lg border shadow-lg">
      {isGameOver ? (
        <>
          <h2 className="text-3xl mb-4">Game Over</h2>
          <p className="text-xl mb-6">Final Score: {score}</p>
        </>
      ) : (
        <>
          <h2 className="text-3xl mb-4">Korean Word Challenge</h2>
          <Instructions />
        </>
      )}
      
      <div className="flex flex-col gap-4 items-center w-full">
        <Select value={difficulty} onValueChange={onChangeDifficulty}>
          <SelectTrigger className="w-full mb-4">
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(LEVELS).map((level) => (
              <SelectItem key={level} value={level}>
                {level.charAt(0) + level.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          onClick={() => onStart(difficulty)}
          className="w-full"
          variant="default"
        >
          {isGameOver ? 'Play Again' : 'Start Game'}
        </Button>
      </div>
    </div>
  </div>
);

interface GameAreaProps {
  gameAreaRef: React.RefObject<HTMLDivElement | null>;
  activeWords: Word[];
  currentInput: string;
  gameOver: boolean;
  gameStarted: boolean;
  score: number;
  difficulty: GameDifficulty;
  onStart: (difficulty: GameDifficulty) => void;
  onChangeDifficulty: (difficulty: GameDifficulty) => void;
  onFocus: () => void;
  paused: boolean;
  onTogglePause: () => void;
}

export const GameArea = ({
  gameAreaRef,
  activeWords,
  currentInput,
  gameOver,
  gameStarted,
  score,
  difficulty,
  onStart,
  onChangeDifficulty,
  onFocus,
  paused,
  onTogglePause
}: GameAreaProps) => (
  <div 
    ref={gameAreaRef as React.RefObject<HTMLDivElement>}
    className="relative w-full h-[calc(100vh-12rem)] border-2 border-border rounded-lg overflow-hidden bg-card"
    style={{ cursor: 'text' }}
    onClick={onFocus}
  >
    {gameStarted && !gameOver && (
      <div className="absolute top-2 right-2 z-10">
        <GameControls
          paused={paused}
          onTogglePause={onTogglePause}
        />
      </div>
    )}
    {(gameOver || !gameStarted) && (
      <GameOverlay 
        score={score} 
        onStart={onStart} 
        difficulty={difficulty} 
        onChangeDifficulty={onChangeDifficulty} 
        isGameOver={gameOver} 
      />
    )}
    
    {activeWords.map(word => (
      <FallingWord 
        key={word.id} 
        word={word} 
        currentInput={currentInput}
      />
    ))}
  </div>
);
