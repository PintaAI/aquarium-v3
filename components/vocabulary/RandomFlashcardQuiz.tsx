"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti"; // Import canvas-confetti
import { getFlashcardWords } from "@/app/game/flashcard/actions/get-flashcard-words";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Zap } from "lucide-react"; // Use lucide-react icon
import { FlippableFlashcard } from "./FlippableFlashcard"; // Import the new component
// Removed useWindowSize import

interface FlashcardWord {
  id: number;
  korean: string;
  indonesian: string;
}

export function RandomFlashcardQuiz() {
  const router = useRouter();
  const [selectedWords, setSelectedWords] = useState<FlashcardWord[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  // Removed useWindowSize hook

  const fetchAndSelectWords = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    // Removed setShowConfetti(false);
    setIsCorrect(null);
    setUserInput("");
    try {
      const result = await getFlashcardWords();
      if (result.success && result.data) {
        const words = result.data;
        if (words.length >= 3) {
          // Select 3 random words
          const shuffled = [...words].sort(() => 0.5 - Math.random());
          setSelectedWords(shuffled.slice(0, 3));
          setCurrentWordIndex(0);
        } else if (words.length > 0) {
          // If less than 3, use all available
          setSelectedWords([...words]);
           setCurrentWordIndex(0);
        } else {
            setError("No flashcard words found for your account.");
            setSelectedWords([]);
        }
      } else {
        setError(result.error || "Failed to fetch words.");
        setSelectedWords([]);
      }
    } catch (err) {
      console.error("Error fetching flashcard words:", err);
      setError("An unexpected error occurred.");
      setSelectedWords([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAndSelectWords();
  }, [fetchAndSelectWords]);

  const handleCheckAnswer = () => {
    if (!selectedWords.length || isChecking) return;

    setIsChecking(true);
    const currentWord = selectedWords[currentWordIndex];
    const correctAnswer = currentWord.indonesian.trim().toLowerCase();
    const userAnswer = userInput.trim().toLowerCase();

    // Simple check for now, might need more robust comparison later
    if (userAnswer === correctAnswer) {
      setIsCorrect(true);
      // Trigger canvas-confetti
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
      });
    } else {
      setIsCorrect(false);
      // Removed setShowConfetti(false);
    }
    setIsChecking(false);
  };

  const handleNextWord = () => {
    setIsCorrect(null);
    setUserInput("");
    // Removed setShowConfetti(false);
    if (currentWordIndex < selectedWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      // Optionally, fetch new words or show a completion message
      fetchAndSelectWords(); // Fetch new set for now
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
    if (isCorrect !== null) {
      setIsCorrect(null); // Reset correctness state on new input
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && userInput.trim() && isCorrect === null) {
      handleCheckAnswer();
    } else if (e.key === 'Enter' && isCorrect !== null) {
      handleNextWord();
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Flashcard Kilat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Flashcard Kilat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 dark:text-red-400 text-center mb-4">
            {error}
          </div>
          <Button onClick={fetchAndSelectWords} variant="outline" size="sm" className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" /> Coba Lagi
          </Button>
         </CardContent>
      </Card>
    );
  }

  if (selectedWords.length === 0) {
     return (
       <Card>
         <CardHeader>
           <CardTitle>Flashcard Kilat</CardTitle>
         </CardHeader>
         <CardContent>
           <div className="text-muted-foreground text-center mb-4">
             Tidak ada kata flashcard yang ditemukan.
           </div>
           <Button onClick={fetchAndSelectWords} variant="outline" size="sm" className="w-full">
             <RefreshCw className="mr-2 h-4 w-4" /> Coba Lagi
           </Button>
         </CardContent>
       </Card>
     );
  }

  const currentWord = selectedWords[currentWordIndex];

  return (
    <Card className="max-w-md mx-auto shadow-lg border-none">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg sm:text-xl flex items-center">
            <Zap className="w-5 h-5 mr-2 text-yellow-500" />
            Flashcard 
            <span className="ml-2 text-sm text-muted-foreground">
              {currentWordIndex + 1}/{selectedWords.length}
            </span>
          </CardTitle>
          <Button 
            onClick={() => router.push('/game/flashcard')}
            variant="secondary" 
            size="sm"
            className="hover:bg-secondary transition-colors animate-pulse hover:animate-none"
          >
            <span className="text-sm font-semibold">Main »</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 px-4 sm:px-6">
        <FlippableFlashcard
          frontContent={
            <span className="text-3xl sm:text-4xl font-bold text-primary dark:text-primary transition-colors font-mono" lang="ko">
              {currentWord.korean}
            </span>
          }
          backContent={
            <div className="space-y-2">
              <span className="text-lg sm:text-2xl font-bold text-accent-foreground dark:text-primary transition-colors">
                {currentWord.indonesian}
              </span>
              {isCorrect === false && (
                <div className="text-sm text-red-500 dark:text-red-400">
                  Jawabanmu: {userInput}
                </div>
              )}
            </div>
          }
          isRevealed={isCorrect !== null}
          isCorrect={isCorrect}
          className="mb-6"
        />
        <div className="space-y-6">
          <Input
            placeholder="Ketik artinya dalam Bahasa Indonesia..."
            value={userInput}
            onChange={handleInputChange}
            className="text-center text-base sm:text-lg py-6 transition-all"
            onKeyDown={handleKeyDown}
            disabled={isCorrect !== null || isChecking}
            aria-label="Jawaban Bahasa Indonesia"
          />

          {isCorrect === null && (
            <Button 
              onClick={handleCheckAnswer} 
              disabled={!userInput.trim() || isChecking} 
              className="w-full py-6 text-base sm:text-lg font-semibold transition-all hover:scale-[1.02]"
            >
              {isChecking ? <RefreshCw className="mr-2 h-5 w-5 animate-spin" /> : null}
              Jawab
            </Button>
          )}

          {/* Next button with improved styling */}
          {isCorrect !== null && (
            <Button 
              onClick={handleNextWord} 
              className="w-full py-6 text-base sm:text-lg font-semibold transition-all hover:scale-[1.02]" 
              variant="secondary"
            >
              Lanjut
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
