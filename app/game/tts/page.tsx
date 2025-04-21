"use client"
import React, { useEffect, useState } from 'react';
import { useHangulGame } from './useHangulGame';
import { GameBoard } from './components/GameBoard';
import { GameControls } from './components/GameControls';
import { GameButtons } from './components/GameButtons';
import { FoundWords } from './components/FoundWords';
import { StartScreen } from './components/StartScreen';
import { GameState, Level } from './types';
import { LEVELS } from './constants';


import { Button } from "@/components/ui/button";
import { ArrowLeft, Languages } from "lucide-react";

const HangulWordGame = () => {
  const [gameState, setGameState] = useState<GameState>('start');
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);

  const {
    grid,
    score,
    foundWords,
    placedWords,
    message,
    hintCooldown,
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
    giveHint,
    resetGame,
  } = useHangulGame({ level: selectedLevel || LEVELS[0] });

  // Initialize the game when level is selected
  useEffect(() => {
    if (selectedLevel) {
      resetGame();
    }
  }, [selectedLevel, resetGame]);

  const handleSelectLevel = (level: Level) => {
    setSelectedLevel(level);
    setGameState('playing');
  };

  // Return to level selection
  const handleBackToStart = () => {
    setGameState('start');
    setSelectedLevel(null);
  };

  if (gameState === 'start') {
    return (
    <div className="h-full flex flex-col p-6">
      <div className="w-full max-w-4xl mx-auto">
                <StartScreen onSelectLevel={handleSelectLevel} />
              </div>
            </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6">
      <div className="w-full max-w-4xl mx-auto">
        {/* Game Header */}
        <div className="flex justify-between items-center px-4 py-3 bg-gradient-to-r from-muted/30 via-transparent to-muted/30 rounded-xl mb-8">
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <Languages className="h-6 w-6 text-primary" />
                  <span className="text-xl font-bold">한글 단어 찾기</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {selectedLevel?.name}
                </span>
              </div>
              <Button
                onClick={handleBackToStart}
                variant="outline"
                size="sm"
                className="gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Ganti Level
              </Button>
            </div>
          </div>
        </div>
        
        <GameControls
          score={score}
          foundWords={foundWords}
          placedWords={placedWords}
          message={message}
          hintCooldown={hintCooldown}
        />
        
        <GameBoard
          grid={grid}
          onMouseDown={handleMouseDown}
          onMouseEnter={handleMouseEnter}
          onMouseUp={handleMouseUp}
        />

        <GameButtons
          hintCooldown={hintCooldown}
          onGiveHint={giveHint}
          onResetGame={resetGame}
        />
        
        <FoundWords foundWords={foundWords} />
      </div>
    </div>
  );
};

export default HangulWordGame;
