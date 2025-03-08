import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface FoundWordsProps {
  foundWords: string[];
}

export function FoundWords({ foundWords }: FoundWordsProps) {
  return (
    <Card className="mt-6 w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg sm:text-xl">
          Kata ({foundWords.length})
        </CardTitle>
        <Separator />
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 justify-start">
          {foundWords.map((word, index) => (
            <Badge 
              key={index} 
              variant="secondary"
              className="px-3 py-1.5 text-sm sm:text-base"
            >
              {word}
            </Badge>
          ))}
          {foundWords.length === 0 && (
            <p className="text-muted-foreground italic text-sm sm:text-base w-full">
              Belum ada kata yang ditemukan
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
