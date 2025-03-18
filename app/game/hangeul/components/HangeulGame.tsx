"use client";

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AnimatePresence } from 'framer-motion';
import { useHangulGame, GameDifficulty, GameMode } from '../hooks/useHangulGame';
import { CharacterDisplay } from './CharacterDisplay';
import { FeedbackDisplay } from './FeedbackDisplay';
import { CharacterInfo } from './CharacterInfo';
import { GameSettings } from './GameSettings';
import { GameResults } from './GameResults';

export default function HangeulGame() {
  // State for character info dialog
  const [showCharacterInfo, setShowCharacterInfo] = useState(false);
  
  // Initialize game with default settings
  const {
    gameState,
    buttonRefs,
    handleOptionClick,
    startGame,
    settings,
  } = useHangulGame();

  // Callback to update settings
  const handleSettingsChange = useCallback((newSettings: {
    totalQuestions: number;
    timePerQuestion: number;
    difficultyLevel: GameDifficulty;
    gameMode: GameMode;
  }) => {
    // Update settings in the game state before restarting
    Object.assign(settings, newSettings);
    startGame();
  }, [startGame, settings]);

  // Handler for character info dialog
  const toggleCharacterInfo = useCallback(() => {
    setShowCharacterInfo(prev => !prev);
  }, []);

  return (
    <div className="flex flex-col items-center p-4 w-full h-full">
      <Card className="w-full h-full flex flex-col shadow-lg border-t-4 border-b-0 border-t-blue-500">
        <CardHeader className="flex-shrink-0 space-y-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl hangeul">한글 Rush</CardTitle>
              <Badge variant="outline" className="uppercase text-xs">
                {settings.difficultyLevel}
              </Badge>
            </div>
            
            {/* Settings Button */}
            <GameSettings
              onSettingsChange={handleSettingsChange}
              currentSettings={settings}
              disabled={!gameState.gameOver && gameState.questionNumber > 1}
            />
          </div>
          
          {!gameState.gameOver && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-muted-foreground">
                  Pertanyaan {gameState.questionNumber}/{settings.totalQuestions}
                </span>
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span className="text-sm font-medium">{gameState.timeLeft}s</span>
                </div>
              </div>
              <Progress 
                value={(gameState.remainingTime)} 
                className="h-2"
                
                // Change color based on remaining time
                style={{
                  background: gameState.remainingTime < 30 
                    ? 'rgba(239, 68, 68, 0.2)' 
                    : gameState.remainingTime < 70 
                      ? 'rgba(245, 158, 11, 0.2)' 
                      : 'rgba(34, 197, 94, 0.2)',
                  '--progress-color': gameState.remainingTime < 30 
                    ? 'rgb(239, 68, 68)' 
                    : gameState.remainingTime < 70 
                      ? 'rgb(245, 158, 11)' 
                      : 'rgb(34, 197, 94)'
                } as React.CSSProperties}
              />
            </div>
          )}
        </CardHeader>

        {/* Game Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 px-6">
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md text-center">
            <div className="text-xs text-muted-foreground mb-1">Skor</div>
            <div className="text-xl font-bold text-primary">{gameState.score}</div>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md text-center">
            <div className="text-xs text-muted-foreground mb-1">Streak</div>
            <div className="text-xl font-bold text-orange-500">{gameState.streak}</div>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md text-center">
            <div className="text-xs text-muted-foreground mb-1">Terbaik</div>
            <div className="text-xl font-bold text-blue-500">{gameState.highScore}</div>
          </div>
        </div>
        
        <CardContent className="flex-grow flex-1 flex-col justify-between relative pt-4">
          <AnimatePresence mode="wait">
            {!gameState.gameOver ? (
              <div className="flex flex-col h-full justify-between">
                {gameState.currentChar && (
                  <div className="flex flex-col items-center justify-center flex-grow h-full mb-4 relative">
                    {/* Character Display */}
                    <div className="flex-grow flex items-center justify-center w-full h-full">
                      <CharacterDisplay 
                        character={gameState.currentChar} 
                        onInfoClick={toggleCharacterInfo}
                      />
                    </div>
                    
                    {/* Feedback Display - positioned absolutely */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-3/4 z-10">
                        <FeedbackDisplay 
                          message={gameState.feedback} 
                          isCorrect={gameState.isCorrect} 
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                
                {/* Answer Options */}
                <div className="grid grid-cols-2 gap-4 w-full mt-auto">
                  {gameState.options.map((option, index) => (
                    <Button
                      key={index}
                      ref={(el) => {
                        buttonRefs.current[index] = el;
                      }}
                      onClick={() => handleOptionClick(option, index)}
                      variant="outline"
                      size="lg"
                      className="w-full text-lg py-6 bg-white dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-slate-700 transition-colors"
                      disabled={!!gameState.feedback}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <GameResults 
                score={gameState.score}
                totalQuestions={settings.totalQuestions}
                correctAnswers={gameState.correctAnswers}
                incorrectAnswers={gameState.incorrectAnswers}
                onRestart={startGame}
              />
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
      
      {/* Character Info Dialog */}
      {gameState.currentChar && (
        <CharacterInfo 
          character={gameState.currentChar}
          isOpen={showCharacterInfo}
          onClose={() => setShowCharacterInfo(false)}
        />
      )}
    </div>
  );
}
