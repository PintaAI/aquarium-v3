import React from 'react';
import { PlacedWord, FoundWord } from '../types';
import { Progress } from "@/components/ui/progress";
import { AlertCircle } from "lucide-react";

interface GameControlsProps {
  score: number;
  foundWords: FoundWord[];
  placedWords: PlacedWord[];
  message: string;
  hintCooldown: boolean;
}

export function GameControls({
  score,
  foundWords,
  placedWords,
  message,
  hintCooldown
}: GameControlsProps) {
  return (
    <div className="flex flex-col gap-4 mb-8">
      {/* Game Stats */}
      <div className="flex justify-between items-center px-4 py-3 bg-gradient-to-r from-muted/30 via-transparent to-muted/30 rounded-xl">
        <div className="flex-1">
          <div className="flex justify-between items-center text-sm font-medium mb-1.5">
            <p>Progress & Stats</p>
            <div className="flex items-center gap-4">
              <p>
                <span className="text-primary font-bold">{foundWords.length}</span>
                <span className="text-muted-foreground">/{placedWords.length}</span>
              </p>
              <span className="border-l border-border/50 h-6" />
              <span className="font-bold text-xl text-primary">{score}</span>
            </div>
          </div>
          <Progress 
            value={hintCooldown ? 100 : 0} 
            className="h-2.5"
            style={{
              transition: hintCooldown ? 'width 5s linear' : 'none',
              width: hintCooldown ? '0%' : '100%'
            }}
          />
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="flex items-center justify-center gap-2 text-center text-sm font-medium text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
          {message}
        </div>
      )}
    </div>
  );
}
