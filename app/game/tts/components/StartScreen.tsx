import React from 'react';
import { Level } from '../types';
import { LEVELS } from '../constants';
import { GameInstructions } from './GameInstructions';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface StartScreenProps {
  onSelectLevel: (level: Level) => void;
}

export function StartScreen({ onSelectLevel }: StartScreenProps) {
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const selectedLevelData = LEVELS.find(level => level.id === selectedLevel);

  return (
    <Card className="w-full h-full flex flex-col shadow-lg bg-gradient-to-b from-muted/30 to-background">
      <CardHeader >
    
            <CardTitle className="text-3xl font-bold hangeul bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent flex items-center gap-2">
              <Languages className="h-8 w-8" />
              한글 단어 찾기
            </CardTitle>
       
      </CardHeader>
      
      <CardContent className="flex-grow flex flex-col items-center justify-center gap-12 pt-12">
        <div className="w-full max-w-xl space-y-8">
          <div>
            <GameInstructions />
          </div>

          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih tingkat kesulitan" />
            </SelectTrigger>
            <SelectContent>
              {LEVELS.map((level) => (
                <SelectItem key={level.id} value={level.id}>
                  {level.name} ({level.gridSize}x{level.gridSize})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            onClick={() => selectedLevelData && onSelectLevel(selectedLevelData)}
            disabled={!selectedLevel}
            className="w-full max-w-md text-lg py-6 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300"
          >
            Mulai Permainan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
