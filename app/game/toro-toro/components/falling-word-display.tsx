'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { VirtualKeyboard } from "@/components/ui/virtual-keyboard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Difficulty } from '../hooks/use-falling-word-game';
import { PresetListType, PRESET_LISTS } from '../data/word-lists';
import SpaceBackground from './space-background';

interface Word {
  id: number;
  term: string;
  definition: string;
}

interface WordWithPosition extends Word {
  positionX: number;
  positionY: number;
  speed: number;
}

interface DictionaryResult {
  term: string;
  definition: string;
}

interface FallingWordDisplayProps {
  fallingWords: WordWithPosition[];
  userInput: string;
  timer: number;
  gameOver: boolean;
  score: number;
  gameStarted: boolean;
  customWords: Word[];
  isUsingCustomWords: boolean;
  dialogOpen: boolean;
  dictionarySearch: string;
  searchResults: DictionaryResult[];
  isSearching: boolean;
  difficulty: Difficulty;
  selectedWordList: PresetListType;
  onInputChange: (value: string) => void;
  onStart: () => void;
  onDialogOpenChange: (open: boolean) => void;
  onDictionarySearch: (query: string) => void;
  onDictionarySearchChange: (value: string) => void;
  onAddCustomWord: (term: string, definition: string) => void;
  onAddFromDictionary: (result: DictionaryResult) => void;
  onRemoveCustomWord: (id: number) => void;
  onUseCustomWords: (use: boolean) => void;
  onSetGameAreaHeight: (height: number) => void;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onWordListChange: (wordList: PresetListType) => void;
}

export function FallingWordDisplay({
  fallingWords,
  userInput,
  timer,
  gameOver,
  score,
  gameStarted,
  customWords,
  isUsingCustomWords,
  dialogOpen,
  dictionarySearch,
  searchResults,
  isSearching,
  difficulty,
  selectedWordList,
  onInputChange,
  onStart,
  onDialogOpenChange,
  onDictionarySearch,
  onDictionarySearchChange,
  onAddCustomWord,
  onAddFromDictionary,
  onRemoveCustomWord,
  onUseCustomWords,
  onSetGameAreaHeight,
  onDifficultyChange,
  onWordListChange,
}: FallingWordDisplayProps) {
  const [newTerm, setNewTerm] = useState('');
  const [newDefinition, setNewDefinition] = useState('');
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  const handleAddCustomWord = () => {
    onAddCustomWord(newTerm, newDefinition);
    setNewTerm('');
    setNewDefinition('');
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!gameAreaRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const height = entries[0]?.contentRect.height;
      if (height) {
        onSetGameAreaHeight(height);
      }
    });

    resizeObserver.observe(gameAreaRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [onSetGameAreaHeight]);

  return (
    <div className="h-[calc(100vh-3rem)] flex max-w-4xl mx-auto flex-col">
      <Card className="flex-1 p-2 sm:p-4 relative overflow-hidden">
        <div className="flex-shrink-0 p-1 relative z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-sm md:text-2xl font-bold">Tangkap Kosa Kata</h2>
            <div className="flex gap-4">
              <span className="md:font-medium text-sm">Score: {score}</span>
              <span className="md:font-medium text-sm">Time: {timer}s</span>
            </div>
          </div>
        </div>

        <div className="p-0 flex flex-col h-[calc(100%-2.5rem)] relative z-10">
          <div 
            ref={gameAreaRef}
            className="game-area relative flex-1 border-2 rounded-lg overflow-hidden"
            style={{ 
              borderColor: 'var(--border)',
            }}
          >
            <SpaceBackground />
            
            <div 
              className="absolute w-full border-t-2 border-destructive"
              style={{ 
                bottom: '50px',
                left: 0,
                right: 0
              }}
            />
            
            <div 
              className="absolute w-full bg-destructive/10"
              style={{ 
                bottom: 0,
                left: 0,
                right: 0,
                height: '50px'
              }}
            />

            {fallingWords.map((word) => (
              <div
                key={`${word.id}-${word.positionY}`}
                className={`
                  absolute transform
                  px-2 py-0.5 md:px-3 md:py-1
                  text-xs md:text-base
                  bg-primary text-primary-foreground 
                  rounded-md shadow-md
                  transition-all duration-200
                `}
                style={{
                  top: `${word.positionY}px`,
                  left: `${word.positionX}%`,
                  transform: 'translateX(-50%)',
                  fontSize: isMobile ? '0.75rem' : '1rem',
                  minWidth: isMobile ? '60px' : '80px',
                }}
              >
                {word.term}
              </div>
            ))}

            {(!gameStarted || gameOver) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm gap-4">
                {gameOver && (
                  <h3 className="text-2xl font-semibold mb-4">
                    Game Selesai! Score: {score}
                  </h3>
                )}
                
                <div className="flex flex-col gap-4 items-center">
                  <Select
                    value={difficulty}
                    onValueChange={(value) => onDifficultyChange(value as Difficulty)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedWordList}
                    onValueChange={(value) => onWordListChange(value as PresetListType)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select word list" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRESET_LISTS).map(([key, list]) => (
                        <SelectItem key={key} value={key}>
                          {list.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Dialog open={dialogOpen} onOpenChange={onDialogOpenChange}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="mt-4">
                      {isUsingCustomWords ? 'Edit Kosa-kata' : 'Pilih Kosa-kata'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Tambahkan dan Cari kosakata</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Search Korean Dictionary..."
                          value={dictionarySearch}
                          onChange={(e) => onDictionarySearchChange(e.target.value)}
                        />
                        <Button 
                          onClick={() => onDictionarySearch(dictionarySearch)}
                          disabled={isSearching}
                        >
                          {isSearching ? 'Searching...' : 'Search'}
                        </Button>
                      </div>

                      {searchResults.length > 0 && (
                        <div className="space-y-2 border rounded p-2">
                          <h3 className="font-semibold">Dictionary Results:</h3>
                          {searchResults.map((result, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 border rounded">
                              <span className="flex-1">{result.term}</span>
                              <span className="flex-1">{result.definition}</span>
                              <Button
                                size="sm"
                                onClick={() => onAddFromDictionary(result)}
                              >
                                Add
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Input
                          placeholder="Term (e.g., 안녕하세요)"
                          value={newTerm}
                          onChange={(e) => setNewTerm(e.target.value)}
                        />
                        <Input
                          placeholder="Definition (e.g., hello)"
                          value={newDefinition}
                          onChange={(e) => setNewDefinition(e.target.value)}
                        />
                        <Button onClick={handleAddCustomWord}>Add</Button>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-semibold">Your Custom Words:</h3>
                        {customWords.map((word) => (
                          <div key={word.id} className="flex items-center gap-2 p-2 border rounded">
                            <span className="flex-1">{word.term}</span>
                            <span className="flex-1">{word.definition}</span>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => onRemoveCustomWord(word.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between mt-4">
                        <Button
                          variant="outline"
                          onClick={() => {
                            onUseCustomWords(false);
                            onDialogOpenChange(false);
                          }}
                        >
                          Use Preset Words
                        </Button>
                        <Button
                          onClick={() => {
                            onUseCustomWords(true);
                            onDialogOpenChange(false);
                          }}
                          disabled={customWords.length === 0}
                        >
                          Done
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  onClick={onStart}
                  size="lg"
                  className="text-lg px-8 mt-4"
                  disabled={isUsingCustomWords && customWords.length === 0}
                >
                  {gameOver ? 'Main Lagi?' : 'Start Game'}
                </Button>
              </div>
            )}
          </div>

          <div className="p-2 border-t bg-background relative z-10">
            <Input
              type="text"
              value={userInput}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder="Type the translation here..."
              className="w-full mb-2"
              disabled={!gameStarted || gameOver}
              autoFocus
            />

            {isMobile && gameStarted && !gameOver && (
              <VirtualKeyboard
                onInputChange={onInputChange}
                userInput={userInput}
                gameStarted={gameStarted}
                gameOver={gameOver}
              />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
