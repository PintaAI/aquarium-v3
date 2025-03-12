"use client";

import React, { useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { GameStats } from './components/GameStats';
import { GameControls } from './components/GameControls';
import { GameArea } from './components/GameArea';
import { useWordGame } from './hooks/useWordGame';
import { calculateGameParams } from './constants';

const WordGame = () => {
  const {
    state,
    refs,
    actions
  } = useWordGame();

  // Set up spawn interval and animation frame
  useEffect(() => {
    if (!state.gameStarted || state.gameOver || state.paused) return;
    
    const { spawnInterval } = calculateGameParams(state.level, state.difficulty);
    const spawnTimer = setInterval(actions.spawnWord, spawnInterval);
    refs.frameRef.current = requestAnimationFrame(actions.updateGame);
    
    return () => {
      clearInterval(spawnTimer);
      cancelAnimationFrame(refs.frameRef.current || 0);
      refs.frameRef.current = null;
    };
  }, [
    state.gameStarted,
    state.gameOver,
    state.paused,
    state.level,
    actions.spawnWord,
    actions.updateGame,
    refs.frameRef
  ]);
  
  return (
    <div className="flex flex-col rounded-2xl items-center w-full max-w-3xl mx-auto min-h-screen">
      <div className="w-full p-4 mb-4 bg-card text-card-foreground rounded-lg border shadow-lg">
        <GameStats
          score={state.score}
          lives={state.lives}
          level={state.level}
        />
      </div>

      <GameArea
        gameAreaRef={refs.gameAreaRef}
        activeWords={state.activeWords}
        currentInput={state.currentInput}
        gameOver={state.gameOver}
        gameStarted={state.gameStarted}
        score={state.score}
        difficulty={state.difficulty}
        onStart={actions.startGame}
        onChangeDifficulty={actions.changeDifficulty}
        onFocus={() => refs.inputRef.current?.focus()}
        paused={state.paused}
        onTogglePause={actions.togglePause}
      />
      
      <div className="w-full mt-4">
        <Input
          ref={refs.inputRef}
          type="text"
          value={state.currentInput}
          onChange={actions.handleInputChange}
          onKeyDown={actions.handleKeyDown}
          className="w-full text-lg"
          placeholder={state.gameStarted && !state.gameOver && !state.paused ? "Type word translations here..." : ""}
          disabled={!state.gameStarted || state.gameOver || state.paused}
          autoComplete="off"
        />
        
        {state.targetWordIndex !== null && state.activeWords[state.targetWordIndex] && (
          <div className="mt-2 text-center text-card-foreground">
            <span className="font-bold">Current word:</span> <span className="korean">{state.activeWords[state.targetWordIndex].korean}</span> → 
            <span className="font-bold text-primary">{state.activeWords[state.targetWordIndex].english}</span>
          </div>
        )}
      </div>
      
    </div>
  );
};

export default WordGame;
