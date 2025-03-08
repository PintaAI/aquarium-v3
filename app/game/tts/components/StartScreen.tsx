import React from 'react';
import { Level } from '../types';
import { LEVELS } from '../constants';
import { GameInstructions } from './GameInstructions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Grid3X3, Languages } from "lucide-react";
import { cn } from "@/lib/utils";

interface StartScreenProps {
  onSelectLevel: (level: Level) => void;
}

export function StartScreen({ onSelectLevel }: StartScreenProps) {
  // Get level-specific styling
  const getLevelConfig = (levelId: string) => {
    switch (levelId) {
      case 'easy':
        return {
          borderClass: 'border-l-4 border-l-emerald-600',
          badgeVariant: 'secondary' as const,
          buttonVariant: 'default' as const
        };
      case 'medium':
        return {
          borderClass: 'border-l-4 border-l-blue-600',
          badgeVariant: 'secondary' as const,
          buttonVariant: 'default' as const
        };
      case 'hard':
        return {
          borderClass: 'border-l-4 border-l-rose-600',
          badgeVariant: 'secondary' as const,
          buttonVariant: 'default' as const
        };
      default:
        return {
          borderClass: '',
          badgeVariant: 'outline' as const,
          buttonVariant: 'default' as const
        };
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <Card className="mb-8 text-center">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl font-bold flex items-center justify-center gap-2">
            <Languages className="h-8 w-8 text-primary" />
            한글 단어 찾기
          </CardTitle>
          <CardDescription className="text-xl sm:text-2xl">
            Hangul Word Game
          </CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {LEVELS.map((level) => {
          const config = getLevelConfig(level.id);
          
          return (
            <Card 
              key={level.id}
              className={cn(
                "overflow-hidden transition-all hover:shadow-md",
                config.borderClass
              )}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">
                  {level.name}
                </CardTitle>
                <CardDescription>
                  {level.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <Badge 
                  variant={config.badgeVariant} 
                  className="flex items-center gap-1"
                >
                  <Grid3X3 className="h-3 w-3" />
                  {level.gridSize}x{level.gridSize} Grid
                </Badge>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => onSelectLevel(level)}
                  className="w-full"
                  variant={config.buttonVariant}
                >
                  Mulai
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      
      <div className="text-center mb-8">
        <p className="text-muted-foreground">
          Pilih-lah tingkat kesulitan yang sesuai dengan kemampuanmu
        </p>
        <Separator className="my-4" />
      </div>
      
      <GameInstructions />
    </div>
  );
}
