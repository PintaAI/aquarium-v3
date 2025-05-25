import React from 'react';
import { HangulCharacter } from '../data/hangulData';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CharacterInfoProps {
  character: HangulCharacter | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CharacterInfo({ character, isOpen, onClose }: CharacterInfoProps) {
  if (!character) return null;
  
  // Get the character type in Indonesian
  const typeMap = {
    'consonant': 'Konsonan',
    'vowel': 'Vokal Tunggal',
    'complex-vowel': 'Vokal Rangkap'
  };
  
  const characterType = typeMap[character.type] || character.type;
  
  // Get the difficulty level in Indonesian
  const difficultyMap = {
    'easy': 'Mudah',
    'medium': 'Sedang', 
    'hard': 'Sulit'
  };
  
  const difficultyLevel = difficultyMap[character.difficulty] || character.difficulty;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-4xl hangeul">{character.character}</span>
            <span>-</span>
            <span>{character.pronunciation}</span>
          </DialogTitle>
          <DialogDescription>
            Informasi tentang karakter Hangeul ini
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-medium">Jenis:</span>
            <span className="col-span-2">{characterType}</span>
          </div>
          
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-medium">Tingkat Kesulitan:</span>
            <span className="col-span-2">{difficultyLevel}</span>
          </div>
          
          {character.description && (
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="font-medium">Cara Pengucapan:</span>
              <span className="col-span-2">{character.description}</span>
            </div>
          )}
          
          <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-md">
            <h4 className="text-sm font-medium mb-2">Contoh Penggunaan:</h4>
            <div className="grid grid-cols-2 gap-2">
              {character.type === 'consonant' && (
                <>
                  <div className="text-center">
                    <div className="text-2xl hangeul mb-1">{character.character}아</div>
                    <div className="text-sm">{character.pronunciation}a</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl hangeul mb-1">{character.character}우</div>
                    <div className="text-sm">{character.pronunciation}u</div>
                  </div>
                </>
              )}
              
              {character.type === 'vowel' && (
                <>
                  <div className="text-center">
                    <div className="text-2xl hangeul mb-1">ㄱ{character.character}</div>
                    <div className="text-sm">G{character.pronunciation.toLowerCase()}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl hangeul mb-1">ㄴ{character.character}</div>
                    <div className="text-sm">N{character.pronunciation.toLowerCase()}</div>
                  </div>
                </>
              )}
              
              {character.type === 'complex-vowel' && (
                <>
                  <div className="text-center">
                    <div className="text-2xl hangeul mb-1">ㄱ{character.character}</div>
                    <div className="text-sm">G{character.pronunciation.toLowerCase()}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl hangeul mb-1">ㄴ{character.character}</div>
                    <div className="text-sm">N{character.pronunciation.toLowerCase()}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
