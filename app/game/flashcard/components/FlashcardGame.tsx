"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AnimatePresence } from 'framer-motion';
import KoreanFlashcard from './KoreanFlashcard';
import { getFlashcardWords } from '../actions/get-flashcard-words';
import { CompletionScreen } from './CompletionScreen';
import { ArrowLeft } from 'lucide-react';

interface FlashcardGameProps {
  collectionId?: number;
  collectionTitle: string;
  onReturn?: () => void;
}

export default function FlashcardGame({ collectionId, collectionTitle, onReturn }: FlashcardGameProps) {
  const [words, setWords] = useState<Array<{id: number; word: string; meaning: string}>>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [studied, setStudied] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  // Load words from database
  useEffect(() => {
    async function loadWords() {
      try {
        const result = await getFlashcardWords(collectionId);
        if (!result.success) {
          throw new Error(result.error);
        }
        // Map API response format to component format
        const mappedWords = (result.data || []).map(item => ({
          id: item.id,
          word: item.korean,
          meaning: item.indonesian
        }));
        setWords(mappedWords);
        setCurrentIndex(0);
        setStudied(new Set());
        setIsRevealed(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load words");
      } finally {
        setLoading(false);
      }
    }

    loadWords();
  }, [collectionId]);

  const nextCard = () => {
    const newStudied = new Set([...studied, currentIndex]);
    setStudied(newStudied);

    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsRevealed(false);
    }
    // Removed the else block, last card logic handled by the button now
  };

  // Handles the click on the "Selesai!" button for the last card
  const handleFinishClick = () => {
    // Ensure the last card is marked studied before completing
    const finalStudied = new Set([...studied, currentIndex]);
    setStudied(finalStudied);
    setIsComplete(true);
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsRevealed(false);
    }
  };

  const restartGame = () => {
    setCurrentIndex(0);
    setStudied(new Set());
    setIsRevealed(false);
    setIsComplete(false);
  };

  if (loading) {
    return (
      <Card className="w-full shadow-lg border-t-4 border-b-0 border-t-blue-500">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-muted-foreground">Loading flashcards...</div>
        </CardContent>
      </Card>
    );
  }

  if (isComplete) {
    return (
      <CompletionScreen
        totalCards={words.length}
        studiedCards={studied.size}
        onRestart={restartGame}
        onNewCollection={onReturn || (() => {})}
      />
    );
  }

  if (error) {
    return (
      <Card className="w-full shadow-lg border-t-4 border-b-0 border-t-red-500">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (words.length === 0) {
    return (
      <Card className="w-full shadow-lg border-t-4 border-b-0 border-t-yellow-500">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-muted-foreground">No flashcards available.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full flex flex-col shadow-lg border-t-4 border-b-0 border-t-primary">
      <CardHeader className="flex-shrink-0 space-y-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
            <div>
              <CardTitle className="text-xl">Flash-Card</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{collectionTitle}</p>
            </div>
 
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onReturn}
              className="text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress info */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-muted-foreground">
                Kata {currentIndex + 1} dari {words.length}
              </span>
              <div className="flex items-center gap-3">
                 <span className="text-sm font-medium text-muted-foreground">
                   {Math.round((studied.size / words.length) * 100)}% Selesai
                 </span>
               </div>
             </div>
             <Progress
              value={(studied.size / words.length) * 100}
              className="h-2"
              // Removed inline style to use default progress bar color
            />
          </div>
      </CardHeader>

      {/* Game Stats */}
      <div className="grid grid-cols-3 gap-4 mt-4 px-6">
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md text-center">
            <div className="text-xs text-muted-foreground mb-1">Dipelajari</div>
            <div className="text-xl font-bold text-primary">{studied.size}</div>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md text-center">
            <div className="text-xs text-muted-foreground mb-1">Total</div>
            <div className="text-xl font-bold text-orange-500">{words.length}</div>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md text-center">
            <div className="text-xs text-muted-foreground mb-1">Sisa</div>
            <div className="text-xl font-bold text-blue-500">{words.length - studied.size}</div>
          </div>
      </div>
      
      <CardContent className="flex-grow flex-1 flex flex-col justify-between relative pt-4">
        <AnimatePresence mode="wait">
          <div className="flex flex-col h-full justify-between">
            {/* Flashcard */}
            <div className="flex-grow flex items-center justify-center w-full h-full mb-8">
              <KoreanFlashcard
                word={words[currentIndex].word}
                meaning={words[currentIndex].meaning}
                initialFlipped={isRevealed}
              />
            </div>

            {/* Navigation buttons */}
            <div className="space-y-4 w-full">
              {currentIndex === words.length - 1 && studied.size === words.length && (
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    onClick={restartGame}
                    size="lg"
                    className="w-full text-lg py-6 bg-white dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-slate-700 transition-colors"
                  >
                    Ulangi Koleksi
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onReturn}
                    size="lg"
                    className="w-full text-lg py-6 bg-white dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-slate-700 transition-colors"
                  >
                    Koleksi Lain
                  </Button>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={prevCard}
                disabled={currentIndex === 0}
                size="lg"
                className="w-full text-lg py-6 bg-white dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-slate-700 transition-colors"
              >
                Sebelumnya
              </Button>
              {currentIndex === words.length - 1 ? (
                // Always show "Selesai!" button on the last card
                <Button
                  variant="default" // Use default (green) style
                  onClick={handleFinishClick} // Call the dedicated finish handler
                  size="lg"
                  className="w-full text-lg py-6 bg-green-500 hover:bg-green-600 text-white"
                >
                  Selesai!
                </Button>
              ) : (
                // Normal "Selanjutnya" button for other cards
                <Button
                  variant="outline"
                  onClick={nextCard}
                  size="lg"
                  className="w-full text-lg py-6 bg-white dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-slate-700 transition-colors"
                >
                  Selanjutnya
                </Button>
              )}
              </div>
            </div>
          </div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
