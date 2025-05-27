import React from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, Lightbulb } from "lucide-react";

interface GameButtonsProps {
  hintCooldown: boolean;
  onGiveHint: () => void;
  onResetGame: () => void;
}

export function GameButtons({
  hintCooldown,
  onGiveHint,
  onResetGame
}: GameButtonsProps) {
  return (
    <div className="flex justify-center gap-2 mt-6 mb-2">
      <Button 
        onClick={onGiveHint}
        variant={hintCooldown ? "outline" : "secondary"}
        className="min-w-[100px]"
        disabled={hintCooldown}
      >
        <Lightbulb className="mr-2 h-4 w-4" />
        {hintCooldown ? 'Tunggu' : 'Hint'}
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
  );
}
