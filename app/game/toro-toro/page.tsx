"use client";

import React, { useEffect, useState } from 'react';
import { getGameVocabularies } from '@/app/actions/vocabulary-actions';
import { Input } from "@/components/ui/input";
import { GameArea } from './components/GameArea';
import { useWordGame } from './hooks/useWordGame';
import { calculateGameParams, updateWordPairs } from './constants';
const WordGame = () => {
  const [gameHeight] = useState('md:h-[calc(100vh-12rem)] h-[calc(100vh-30rem)] ');
  const [selectedCollection, setSelectedCollection] = useState<number | undefined>();

  useEffect(() => {
    const loadVocabulary = async () => {
      try {
        const result = await getGameVocabularies(selectedCollection);
        if (result.success && result.data) {
          updateWordPairs(result.data);
        } else {
          console.error('Failed to load vocabulary:', result.error);
        }
      } catch (error) {
        console.error('Error loading vocabulary:', error);
      }
    };
    
    loadVocabulary();
  }, [selectedCollection]);

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
    state.difficulty,
    actions.spawnWord,
    actions.updateGame,
    refs.frameRef
  ]);
  
  return (
    <div className="flex flex-col rounded-2xl items-center w-full max-w-3xl mx-auto gap-4 overflow-hidden md:overflow-auto">

      <GameArea
        height={gameHeight}
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
        onSelectCollection={setSelectedCollection}
        lives={state.lives}
        level={state.level}
      />
      
      <div className="w-full mt-4 relative">
        {state.targetWordIndex !== null && state.activeWords[state.targetWordIndex] && (
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-center text-card-foreground">
            <span className="font-bold">Current word:</span> <span className="korean">{state.activeWords[state.targetWordIndex].korean}</span> → 
            <span className="font-bold text-primary">{state.activeWords[state.targetWordIndex].english}</span>
          </div>
        )}
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
      </div>
      
    </div>
  );
};

export default WordGame;
