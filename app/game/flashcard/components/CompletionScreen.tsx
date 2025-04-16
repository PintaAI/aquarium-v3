"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CompletionScreenProps {
  totalCards: number;
  studiedCards: number;
  onRestart: () => void;
  onNewCollection: () => void;
}

export function CompletionScreen({ 
  totalCards, 
  studiedCards, 
  onRestart, 
  onNewCollection 
}: CompletionScreenProps) {
  const percentage = Math.round((studiedCards / totalCards) * 100);

  return (
    <Card className="w-full shadow-lg border-t-4 border-b-0 border-t-green-500">
      <CardContent className="flex flex-col items-center justify-center p-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-green-500">Selamat!</h2>
          <p className="text-lg text-muted-foreground">
            Anda telah menyelesaikan {studiedCards} dari {totalCards} kartu
          </p>
          <div className="text-4xl font-bold text-primary">
            {percentage}%
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Button 
            onClick={onRestart}
            size="lg"
            className="w-full"
          >
            Ulangi Koleksi Ini
          </Button>
          <Button 
            onClick={onNewCollection}
            variant="outline"
            size="lg"
            className="w-full"
          >
            Pilih Koleksi Lain
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
