import { FoundWord } from '../types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface FoundWordsProps {
  foundWords: FoundWord[];
}

export const FoundWords = ({ foundWords }: FoundWordsProps) => {
  if (foundWords.length === 0) return null;

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Kata ditemukan:</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {foundWords.map(({ word, meaning }, index) => (
            <Card key={index} className="bg-muted">
              <CardContent className="p-3">
                <div className="text-lg font-medium">{word}</div>
                <div className="text-sm text-muted-foreground">{meaning}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
