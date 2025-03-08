"use client"
import React, { useEffect, useState } from 'react';
import { useHangulGame } from './useHangulGame';
import { GameBoard } from './components/GameBoard';
import { GameControls } from './components/GameControls';
import { FoundWords } from './components/FoundWords';
import { StartScreen } from './components/StartScreen';
import { GameState, Level } from './types';
import { LEVELS } from './constants';

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
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
    createBoard
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
    return <StartScreen onSelectLevel={handleSelectLevel} />;
  }

  return (
    <div className="flex flex-col items-center p-2 sm:p-4 font-sans pb-24">
      <div className="w-full max-w-4xl mx-auto">
        <Card className="mb-4">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xl sm:text-2xl flex flex-col">
              <div className="flex items-center gap-2">
                <Languages className="h-6 w-6 text-primary" />
                한글 단어 찾기
              </div>
              <span className="text-lg sm:text-xl text-muted-foreground font-normal">
                Hangul Word Game - {selectedLevel?.name}
              </span>
            </CardTitle>
            <Button
              onClick={handleBackToStart}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Change Level
            </Button>
          </CardHeader>
        </Card>
        
        <GameControls
          score={score}
          foundWords={foundWords}
          placedWords={placedWords}
          message={message}
          hintCooldown={hintCooldown}
          onGiveHint={giveHint}
          onResetGame={resetGame}
        />
        
        <GameBoard
          grid={grid}
          onMouseDown={handleMouseDown}
          onMouseEnter={handleMouseEnter}
          onMouseUp={handleMouseUp}
        />
        
        <FoundWords foundWords={foundWords} />
      </div>
    </div>
  );
};

export default HangulWordGame;
