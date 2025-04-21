"use client";

import React from 'react';
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface FlippableFlashcardProps {
  frontContent: React.ReactNode; // Content for the front (e.g., Korean word)
  backContent: React.ReactNode;  // Content for the back (e.g., Indonesian meaning)
  isRevealed: boolean;           // Controls the flip state externally
  isCorrect?: boolean | null;    // Indicates if answer was correct
  className?: string;            // Optional additional styling for the container
}

export function FlippableFlashcard({
  frontContent,
  backContent,
  isRevealed,
  isCorrect,
  className
}: FlippableFlashcardProps) {

  const getBackgroundColor = () => {
    if (isCorrect === null || !isRevealed) return "border-primary/30 bg-primary/5 dark:bg-primary/10";
    if (isCorrect) return "border-green-500/50 bg-green-50 dark:bg-green-900/20";
    return "border-red-500/50 bg-red-50 dark:bg-red-900/20";
  };

  return (
    // Container outer for 3D perspective effect
    <div
      className={cn(
        "w-full h-36 sm:h-48 [perspective:1000px]", // Adjust size as needed
        className // Allow external classes
      )}
      // Removed onClick handler - flip is controlled by isRevealed prop
    >
      {/* Inner container for the flip transformation */}
      <div
        className={cn(
          "relative w-full h-full transition-transform duration-500 ease-in-out [transform-style:preserve-3d]",
          isRevealed ? "[transform:rotateY(180deg)]" : "[transform:rotateY(0deg)]"
        )}
        aria-hidden={!isRevealed} // Hide back content from screen readers initially
      >
        {/* Front Side */}
        <Card
          className={cn(
            "absolute w-full h-full [backface-visibility:hidden]", // Hide back when facing front
            "flex flex-col items-center justify-center text-center",
            "border-2",
            getBackgroundColor() // Dynamic background based on correctness
          )}
          aria-hidden={isRevealed} // Hide from screen readers when flipped
        >
          <CardContent className="p-4">
            {frontContent}
          </CardContent>
        </Card>

        {/* Back Side */}
        <Card
          className={cn(
            "absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]", // Start rotated
            "flex flex-col items-center justify-center text-center",
            "border-2",
            getBackgroundColor() // Same background for consistency
          )}
          aria-hidden={!isRevealed} // Hide from screen readers initially
        >
          <CardContent className="p-4">
            {backContent}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
