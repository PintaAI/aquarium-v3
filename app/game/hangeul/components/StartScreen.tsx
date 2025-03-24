import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GameSettings } from './GameSettings';
import { GameDifficulty, GameMode } from '../hooks/useHangulGame';

interface StartScreenProps {
  onStart: () => void;
  onSettingsChange: (settings: {
    totalQuestions: number;
    timePerQuestion: number;
    difficultyLevel: GameDifficulty;
    gameMode: GameMode;
  }) => void;
  currentSettings: {
    totalQuestions: number;
    timePerQuestion: number;
    difficultyLevel: GameDifficulty;
    gameMode: GameMode;
  };
}

export function StartScreen({ onStart, onSettingsChange, currentSettings }: StartScreenProps) {
  return (
    <Card className="w-full h-full flex flex-col shadow-lg border-t-4 border-b-0 border-t-blue-500">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-2xl hangeul">한글 Rush</CardTitle>
            <Badge variant="outline" className="uppercase text-xs">
              {currentSettings.difficultyLevel}
            </Badge>
          </div>
          <GameSettings
            onSettingsChange={onSettingsChange}
            currentSettings={currentSettings}
            disabled={false}
          />
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center text-center gap-6">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Selamat Datang di Hangeul Rush</h2>
          <p className="text-muted-foreground">
            Uji pengetahuan alfabet Korea Anda dengan permainan yang seru ini.
            Pilih pengucapan yang benar untuk setiap karakter sebelum waktu habis!
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
            <div className="text-sm text-muted-foreground">Pertanyaan</div>
            <div className="text-2xl font-bold">{currentSettings.totalQuestions}</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
            <div className="text-sm text-muted-foreground">Waktu/Pertanyaan</div>
            <div className="text-2xl font-bold">{currentSettings.timePerQuestion}s</div>
          </div>
        </div>

        <Button 
          size="lg" 
          className="w-full max-w-md text-lg py-6"
          onClick={onStart}
        >
          Mulai Permainan
        </Button>
      </CardContent>
    </Card>
  );
}
