'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Difficulty } from '../hooks/use-falling-word-game';
import { WordCollectionCard } from './word-collection-card';
import SpaceBackground from './space-background';
import { AudioController } from './audio-controller';
import confetti from 'canvas-confetti';

interface Word {
  id: number;
  term: string;
  definition: string;
}

interface WordCollection {
  name: string;
  words: Word[];
  isPublic: boolean;
  user?: {
    name: string | null;
    role: string;
  } | null;
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
  selectedWordList: string;
  wordCollections: WordCollection[];
  isLoading: boolean;
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
  onWordListChange: (wordList: string) => void;
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
  wordCollections,
  isLoading,
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
  const previousWordsRef = useRef<WordWithPosition[]>([]);

  const handleAddCustomWord = () => {
    onAddCustomWord(newTerm, newDefinition);
    setNewTerm('');
    setNewDefinition('');
  };

  const fireConfetti = (x: number, y: number) => {
    const gameArea = gameAreaRef.current;
    if (!gameArea) return;

    const rect = gameArea.getBoundingClientRect();
    const relativeX = (x / 100) * rect.width;
    
    confetti({
      particleCount: 25,
      spread: 360,
      origin: { 
        x: (rect.left + relativeX) / window.innerWidth,
        y: (rect.top + y) / window.innerHeight
      },
      colors: ['#FF577F', '#FF884B', '#FFB200', '#00A19D'],
      ticks: 150,
      gravity: 1,
      scalar: 0.8,
      decay: 0.7,
      shapes: ['circle', 'square'],
      disableForReducedMotion: true
    });
  };

  useEffect(() => {
    if (previousWordsRef.current.length > fallingWords.length) {
      const removedWord = previousWordsRef.current.find(prevWord => 
        !fallingWords.some(currentWord => currentWord.id === prevWord.id)
      );

      if (removedWord) {
        fireConfetti(removedWord.positionX, removedWord.positionY);
      }
    }
    
    previousWordsRef.current = fallingWords;
  }, [fallingWords]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    window.addEventListener('screenfit', (event: any) => {
      const { height } = event.detail;
      if (height) {
        onSetGameAreaHeight(height);
      }
    });
  }, [onSetGameAreaHeight]);

  if (isLoading) {
    return (
      <div className="h-screen flex w-full items-center justify-center">
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
          <p>Memuat koleksi kosakata...</p>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="h-screen flex w-full touch-none"
      style={{
        height: 'var(--viewport-height, 100vh)',
        transform: 'translateY(var(--viewport-offset-top, 0))',
        transition: 'transform 0.3s ease-out',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden'
      }}
    >
      <Card className="flex-1 p-2 sm:p-4 relative overflow-hidden m-0">
        <div className="flex-shrink-0 p-1 relative z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-sm md:text-2xl font-bold">Toro-Toro</h2>
            <div className="flex items-center gap-4">
              <AudioController 
                audioPath="/sound/background-vocabullary.mp3"
                autoPlay={false}
                loop={true}
              />
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
              width: '100%'
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
                  px-1 py-0.5 md:px-2 md:py-0.5
                  text-xs md:text-base
                  bg-primary text-primary-foreground 
                  rounded-md shadow-md
                  transition-all duration-200
                  whitespace-nowrap
                `}
                style={{
                  top: `${word.positionY}px`,
                  left: `${word.positionX}%`,
                  transform: 'translateX(-50%)',
                  fontSize: isMobile ? '0.75rem' : '1rem',
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
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Dialog open={dialogOpen} onOpenChange={onDialogOpenChange}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="mt-4">
                      Pilih Kosa-Kata
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                    <DialogHeader>
                      <DialogTitle>Pilih Koleksi Kosakata</DialogTitle>
                    </DialogHeader>

                    <Tabs defaultValue="collections" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="collections">Koleksi Kosa-Kata</TabsTrigger>
                        <TabsTrigger value="custom">Manual</TabsTrigger>
                      </TabsList>

                      <TabsContent value="collections" className="mt-4">
                        <ScrollArea className="h-[60vh]">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
                            {wordCollections.map((collection) => (
                              <WordCollectionCard
                                key={collection.name}
                                title={collection.name}
                                itemCount={collection.words.length}
                                previewWord={collection.words[0] ? {
                                  term: collection.words[0].term,
                                  definition: collection.words[0].definition
                                } : undefined}
                                isSelected={selectedWordList === collection.name}
                                isPublic={collection.isPublic}
                                user={collection.user}
                                onClick={() => {
                                  onWordListChange(collection.name);
                                  onUseCustomWords(false);
                                  onDialogOpenChange(false);
                                }}
                              />
                            ))}
                          </div>
                        </ScrollArea>
                      </TabsContent>

                      <TabsContent value="custom" className="mt-4">
                        <ScrollArea className="h-[60vh]">
                          <div className="pr-4 space-y-4">
                            <div className="flex gap-2">
                              <Input
                                placeholder="Cari di Kosa-kata - ( Bahasa Korea )"
                                value={dictionarySearch}
                                onChange={(e) => onDictionarySearchChange(e.target.value)}
                              />
                              <Button 
                                onClick={() => onDictionarySearch(dictionarySearch)}
                                disabled={isSearching}
                              >
                                {isSearching ? 'Searching...' : 'Cari'}
                              </Button>
                            </div>

                            {searchResults.length > 0 && (
                              <div className="space-y-2 border rounded p-4">
                                <h3 className="font-semibold">Dictionary Results:</h3>
                                <div className="grid gap-2">
                                  {searchResults.map((result, index) => (
                                    <div key={index} className="flex items-center gap-2 p-2 border rounded bg-card">
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
                              </div>
                            )}

                            <div className="flex gap-2">
                              <Input
                                placeholder="안녕하세요"
                                value={newTerm}
                                onChange={(e) => setNewTerm(e.target.value)}
                              />
                              <Input
                                placeholder="halo"
                                value={newDefinition}
                                onChange={(e) => setNewDefinition(e.target.value)}
                              />
                              <Button className='text-lg m-0 p-5' onClick={handleAddCustomWord}>+</Button>
                            </div>

                            <div className="space-y-2">
                              <h3 className="font-semibold">Kosa-Kata mu:</h3>
                              <div className="grid gap-2">
                                {customWords.map((word) => (
                                  <div key={word.id} className="flex items-center gap-2 p-2 border rounded bg-card">
                                    <span className="flex-1">{word.term}</span>
                                    <span className="flex-1">{word.definition}</span>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => onRemoveCustomWord(word.id)}
                                    >
                                      hapus
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {customWords.length > 0 && (
                              <Button
                                className="w-full"
                                onClick={() => {
                                  onUseCustomWords(true);
                                  onDialogOpenChange(false);
                                }}
                              >
                                Gunakan Kosakata Custom ({customWords.length} kata)
                              </Button>
                            )}
                          </div>
                        </ScrollArea>
                      </TabsContent>
                    </Tabs>
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

          <div 
            className="p-2 border-t bg-background relative z-10"
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              transform: 'translateY(calc(-1 * var(--viewport-offset-top, 0)))',
            }}
          >
            <Input
              type="text"
              value={userInput}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder="Ketik disini..."
              className="w-full text-center"
              disabled={!gameStarted || gameOver}
              autoFocus
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
