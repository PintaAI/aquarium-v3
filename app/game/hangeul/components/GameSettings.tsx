import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { GameDifficulty, GameMode } from '../hooks/useHangulGame';

interface GameSettingsProps {
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
  disabled?: boolean;
}

export function GameSettings({ 
  onSettingsChange, 
  currentSettings,
  disabled = false 
}: GameSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState(currentSettings);

  const handleSave = () => {
    onSettingsChange(settings);
    setIsOpen(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2"
          disabled={disabled}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          <span>Pengaturan</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pengaturan Permainan</DialogTitle>
          <DialogDescription>
            Sesuaikan pengaturan untuk tantangan yang sesuai dengan level Anda.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="difficulty" className="text-right">
              Kesulitan
            </Label>
            <Select
              value={settings.difficultyLevel}
              onValueChange={(value: GameDifficulty) => 
                setSettings({ ...settings, difficultyLevel: value })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih level kesulitan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Mudah</SelectItem>
                <SelectItem value="medium">Sedang</SelectItem>
                <SelectItem value="hard">Sulit</SelectItem>
                <SelectItem value="all">Semua</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="questions" className="text-right">
              Pertanyaan
            </Label>
            <Select
              value={settings.totalQuestions.toString()}
              onValueChange={(value) => 
                setSettings({ ...settings, totalQuestions: parseInt(value, 10) })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Jumlah pertanyaan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 pertanyaan</SelectItem>
                <SelectItem value="10">10 pertanyaan</SelectItem>
                <SelectItem value="15">15 pertanyaan</SelectItem>
                <SelectItem value="20">20 pertanyaan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="time" className="text-right">
              Waktu
            </Label>
            <Select
              value={settings.timePerQuestion.toString()}
              onValueChange={(value) => 
                setSettings({ ...settings, timePerQuestion: parseInt(value, 10) })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Waktu per pertanyaan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 detik</SelectItem>
                <SelectItem value="10">10 detik</SelectItem>
                <SelectItem value="15">15 detik</SelectItem>
                <SelectItem value="20">20 detik</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="mode" className="text-right">
              Mode
            </Label>
            <Select
              value={settings.gameMode}
              onValueChange={(value: GameMode) => 
                setSettings({ ...settings, gameMode: value })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Mode permainan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quiz">Kuis</SelectItem>
                <SelectItem value="learning">Belajar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={handleSave}>Simpan Pengaturan</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
