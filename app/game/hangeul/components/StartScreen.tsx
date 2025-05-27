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
    <Card className="w-full h-full flex flex-col shadow-lg bg-gradient-to-b from-muted/30 to-background">
      <CardHeader className="flex-shrink-0 pb-0 relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <CardTitle className="text-3xl font-bold hangeul bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
              한글 Rush
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="uppercase text-xs border-accent">
                {currentSettings.difficultyLevel}
              </Badge>
              <Badge variant="outline" className="uppercase text-xs border-accent">
                {currentSettings.gameMode === 'quiz' ? 'Quiz' : 'Learning'}
              </Badge>
            </div>
          </div>
          <GameSettings
            onSettingsChange={onSettingsChange}
            currentSettings={currentSettings}
            disabled={false}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-transparent to-accent/10 animate-gradient" />
      </CardHeader>

      <CardContent className="flex-grow flex flex-col items-center justify-center gap-12 pt-12">
        <div className="relative">
          <h2 className="text-4xl font-bold mb-3">Selamat Datang di Hangeul Rush</h2>
          <p className="text-muted-foreground text-lg max-w-md">
            Uji pengetahuan alfabet Korea Anda dengan permainan yang seru ini.
            Pilih pengucapan yang benar untuk setiap karakter sebelum waktu habis!
          </p>
        </div>
        
        <div className="w-full max-w-xl space-y-8">
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="bg-gradient-to-br from-muted/30 to-background text-center p-4 rounded-lg border border-border/50 shadow-sm">
              <div className="text-primary font-medium mb-1">Pertanyaan</div>
              <div className="text-2xl font-bold">{currentSettings.totalQuestions}</div>
            </div>
            <div className="bg-gradient-to-br from-muted/30 to-background text-center p-4 rounded-lg border border-border/50 shadow-sm">
              <div className="text-primary font-medium mb-1">Waktu</div>
              <div className="text-2xl font-bold">{currentSettings.timePerQuestion}s</div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Button 
              size="lg" 
              className="w-full max-w-xl text-lg py-6 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300"
              onClick={onStart}
            >
              Mulai Permainan
            </Button>

          </div>
        </div>
      </CardContent>
    </Card>
  );
}
