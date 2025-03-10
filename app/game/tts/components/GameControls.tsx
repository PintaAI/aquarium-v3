import React from 'react';
import { PlacedWord, FoundWord } from '../types';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, RefreshCw, Lightbulb } from "lucide-react";

interface GameControlsProps {
  score: number;
  foundWords: FoundWord[];
  placedWords: PlacedWord[];
  message: string;
  hintCooldown: boolean;
  onGiveHint: () => void;
  onResetGame: () => void;
}

export function GameControls({
  score,
  foundWords,
  placedWords,
  message,
  hintCooldown,
  onGiveHint,
  onResetGame
}: GameControlsProps) {
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between w-full mb-4 gap-4">
        <Card className="flex-1">
          <CardContent className="p-3 flex flex-wrap items-center gap-4 justify-center sm:justify-start">
            <div className="font-bold text-sm">Skor: {score}</div>
            <Separator orientation="vertical" className="h-6 hidden sm:block" />
            <div>Kata: {foundWords.length}/{placedWords.length}</div>
          </CardContent>
        </Card>
        
        <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
          <Button 
            onClick={onGiveHint}
            variant={hintCooldown ? "outline" : "secondary"}
            className="min-w-[100px] relative"
            disabled={hintCooldown}
          >
            <Lightbulb className="mr-2 h-4 w-4" />
            {hintCooldown ? 'Tunggu 5d' : 'Hint'}
            {hintCooldown && (
              <Progress 
                value={0} 
                max={100} 
                className="absolute bottom-0 left-0 right-0 h-1 animate-progress bg-secondary"
                style={{
                  animationDuration: '5s',
                  animationTimingFunction: 'linear'
                }}
              />
            )}
          </Button>
          <Button 
            onClick={onResetGame}
            variant="default"
            className="min-w-[100px]"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Main Baru
          </Button>
        </div>
      </div>
      
      <Card className="mb-4 w-full overflow-hidden">
        <CardContent className="p-3 flex items-center justify-center gap-2 text-center font-medium">
          <AlertCircle className="h-4 w-4 text-primary" />
          {message}
        </CardContent>
      </Card>
    </>
  );
}
