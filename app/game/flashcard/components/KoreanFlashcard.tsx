import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

// Props:
// - word: String (Kosakata Bahasa Korea)
// - meaning: String (Arti kosakata)
// - initialFlipped: Boolean (Opsional, apakah kartu dimulai dalam keadaan terbalik)
interface KoreanFlashcardProps {
  word: string;
  meaning: string;
  initialFlipped?: boolean;
}

function KoreanFlashcard({ word, meaning, initialFlipped = false }: KoreanFlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(initialFlipped);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    // Container luar untuk efek perspektif 3D + hover effect
    <div
      className="w-[85vw] max-w-[320px] h-36 sm:w-72 sm:h-48 [perspective:1000px] cursor-pointer group transition-all duration-200 ease-out hover:-translate-y-1.5 hover:scale-[1.02]"
      onClick={handleFlip}
      role="button" // Tambahkan role untuk aksesibilitas
      tabIndex={0} // Buat div bisa difokus dan di-klik via keyboard
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleFlip()} // Flip dengan Enter/Space
      aria-live="polite" // Umumkan perubahan konten saat flip
      aria-label={`Flashcard: ${isFlipped ? meaning : word}. Klik untuk membalik.`}
    >
      {/* Container dalam untuk transformasi flip */}
      <div
        className={cn(
          "relative w-full h-full transition-all duration-300 ease-in-out [transform-style:preserve-3d]",
          isFlipped ? "[transform:rotateY(180deg)]" : "[transform:rotateY(0deg)]"
        )}
      >
        {/* Sisi Depan (Kosakata Korea) - Using Primary Theme Colors */}
        <Card
          className={cn(
            "absolute w-full h-full [backface-visibility:hidden]", // Sembunyikan bagian belakang saat menghadap depan
            "flex flex-col items-center justify-center text-center",
            "border-2 border-primary/30 bg-primary/5 dark:bg-primary/10", // Lighter backgrounds for better contrast
            "group-hover:shadow-lg group-hover:shadow-primary/30 transition-all" // Enhanced hover shadow
          )}
        >
          <CardContent className="p-4">
            {/* Use primary text color */}
            <span className="text-4xl sm:text-4xl font-bold text-primary dark:text-primary transition-colors" lang="ko">
              {word}
            </span>
          </CardContent>
        </Card>

        {/* Sisi Belakang (Arti) - Using Accent Theme Colors */}
        <Card
          className={cn(
            "absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]", // Sisi ini dimulai terbalik & sembunyikan belakangnya
            "flex flex-col items-center justify-center text-center",
            "border-2 border-accent/30 bg-accent/5 dark:bg-accent/10", // Lighter backgrounds for better contrast
            "group-hover:shadow-lg group-hover:shadow-accent/30 transition-all" // Enhanced hover shadow
          )}
        >
          <CardContent className="p-4">
            {/* Use accent text color */}
            <span className="text-lg sm:text-2xl font-bold text-accent-foreground dark:text-primary transition-colors">
              {meaning}
            </span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default KoreanFlashcard;
