import React from "react";
import { GameControls } from "./GameControls";
import { FallingWord } from "./FallingWord";
import { GameDifficulty, Word } from "../types";
import { LEVELS } from "../constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CollectionSelector } from "./CollectionSelector";
import { GameStats } from "./GameStats";

interface GameOverlayProps {
  score?: number;
  onStart: (difficulty: GameDifficulty) => void;
  difficulty: GameDifficulty;
  onChangeDifficulty: (difficulty: GameDifficulty) => void;
  onSelectCollection: (collectionId?: number) => void;
}



const GameOverlay = ({ score, onStart, difficulty, onChangeDifficulty, onSelectCollection, isGameOver }: GameOverlayProps & { isGameOver: boolean }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-background/95 text-foreground">
    <div className="text-center max-w-md p-6 bg-card rounded-lg border shadow-lg">
      {isGameOver ? (
        <>
          <h2 className="text-3xl mb-4">Game Over</h2>
          <p className="text-xl mb-6">Final Score: {score}</p>
        </>
      ) : (
        <>
          <h2 className="text-3xl mb-4">TORO-TORO</h2>
          
        </>
      )}
      
      <div className="flex flex-col gap-4 items-center w-full">
        <CollectionSelector onSelect={onSelectCollection} />
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
  onSelectCollection: (collectionId?: number) => void;
  lives: number;
  level: number;
  height?: string;
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
  onTogglePause,
  onSelectCollection,
  lives,
  level,
  height,
}: GameAreaProps) => (
  <div 
    ref={gameAreaRef as React.RefObject<HTMLDivElement>}
    className={`relative w-full ${height || 'h-[calc(100vh-12rem)]'} border-2 border-border rounded-lg overflow-hidden bg-card`}
    style={{ cursor: 'text' }}
    onClick={onFocus}
  >
    {gameStarted && !gameOver && (
      <>
        <div className="absolute top-2 left-2 right-2 z-10 px-4">
          <GameStats
            score={score}
            lives={lives}
            level={level}
          />
        </div>
        <div className="absolute top-12 right-5 z-10">
          <GameControls
            paused={paused}
            onTogglePause={onTogglePause}
          />
        </div>
      </>
    )}
    {(gameOver || !gameStarted) && (
      <GameOverlay 
        score={score} 
        onStart={onStart} 
        difficulty={difficulty} 
        onChangeDifficulty={onChangeDifficulty}
        onSelectCollection={onSelectCollection}
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
