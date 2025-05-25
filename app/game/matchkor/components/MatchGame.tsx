"use client"

import { useState, useEffect, useCallback } from "react"
import { Progress } from "@/components/ui/progress";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { getMatchWords } from "../actions/get-match-words"; // Import the action

// Update Props
interface MatchGameProps {
  pairCount: number; // Use pairCount directly
  collectionId?: number; // Add collectionId
  onGameEnd: (score: number) => void;
}

// Update Type for fetched items
type GameItem = {
  id: string; // Use string ID from action ('{dbId}-ko' or '{dbId}-id')
  content: string;
  type: "korean" | "indonesian";
  pairId: number; // Use pairId from action
  isFlipped: boolean;
  isMatched: boolean;
};

// Define time limits (can be adjusted)
const TIME_LIMITS: Record<number, number> = {
  6: 90,  // 1 min 30 sec for 6 pairs
  8: 120, // 2 min for 8 pairs
  10: 150, // 2 min 30 sec for 10 pairs
};

export default function MatchGame({ pairCount, collectionId, onGameEnd }: MatchGameProps) {
  const timeLimit = TIME_LIMITS[pairCount] || 120; // Default time limit if pairCount is unusual

  // Game state
  const [gameItems, setGameItems] = useState<GameItem[]>([]); // Use new type and name
  const [flippedItemIds, setFlippedItemIds] = useState<string[]>([]); // Use string IDs
  const [matchedPairCount, setMatchedPairCount] = useState<number>(0); // Track matched pairs
  const [score, setScore] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(timeLimit);
  const [gameActive, setGameActive] = useState<boolean>(false); // Start inactive until words are loaded

  // End game function wrapped in useCallback
  const endGame = useCallback(() => {
    setGameActive(false);
    onGameEnd(score);
  }, [score, onGameEnd]);

  // Fetch words on component mount or when props change
  useEffect(() => {
    async function loadWords() {
      setGameItems([]); // Clear previous items
      setMatchedPairCount(0);
      setScore(0);
      setFlippedItemIds([]);
      setGameActive(false); // Ensure game is inactive while loading

      try {
        const result = await getMatchWords(pairCount, collectionId);
        if (!result.success || !result.data) {
          throw new Error(result.error || "Failed to load words for the game.");
         }
         // Initialize game items with isFlipped and isMatched set to false
         // Explicitly cast item.type to satisfy GameItem['type']
         const initialItems: GameItem[] = result.data.map((item) => ({
           ...item,
           type: item.type as "korean" | "indonesian", // Explicit cast here
           isFlipped: false,
           isMatched: false,
        }));
        setGameItems(initialItems);
        setTimeRemaining(TIME_LIMITS[pairCount] || 120); // Reset timer based on actual pair count
        setGameActive(true); // Activate game after successful load
      } catch (err) {
        console.error(err instanceof Error ? err.message : "An unknown error occurred");
        setGameActive(false);
      }
    }

    loadWords();
  }, [pairCount, collectionId]); // Rerun effect if pairCount or collectionId changes

  // Game timer
  useEffect(() => {
    if (!gameActive || gameItems.length === 0) return; // Don't run timer if game not active or no items

    const timeoutId: NodeJS.Timeout | null = null;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Use a microtask to ensure state update before calling endGame
          queueMicrotask(endGame);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup function
    return () => {
      clearInterval(timer);
      if (timeoutId) clearTimeout(timeoutId); // Clear timeout if component unmounts before it runs
    };
  }, [gameActive, endGame, gameItems.length]); // Add gameItems.length dependency

  // Store final score for win condition
  const [finalScore, setFinalScore] = useState<number | null>(null);

  // Check for win condition (all pairs matched)
  useEffect(() => {
    // Ensure pairCount is positive and matches the number of pairs derived from gameItems
    const actualPairCount = gameItems.length / 2;
    if (actualPairCount > 0 && matchedPairCount === actualPairCount) {
      const timeBonus = Math.floor(timeRemaining * 0.5); // Example time bonus
      const newFinalScore = score + timeBonus;

      // Trigger confetti effect
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

      setGameActive(false); // Stop the game
      setFinalScore(newFinalScore); // Set final score to trigger end transition
    }
  }, [matchedPairCount, gameItems.length, score, timeRemaining]); // Depend on matchedPairCount and gameItems length

  // Handle game end transition after final score is set
  useEffect(() => {
    if (finalScore !== null) {
      const timer = setTimeout(() => {
        onGameEnd(finalScore); // Call the prop function passed from parent
      }, 1500); // Short delay before calling onGameEnd
      return () => clearTimeout(timer);
    }
  }, [finalScore, onGameEnd]);

  // Helper functions for item management
  const markAsMatched = (id1: string, id2: string) => {
    setGameItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id1 || item.id === id2
          ? { ...item, isMatched: true, isFlipped: true } // Keep matched items flipped
          : item
      )
    );
    setMatchedPairCount((prev) => prev + 1);
    setScore((prev) => prev + 10); // Award points
  };

  const flipBack = (id1: string, id2: string) => {
    setGameItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id1 || item.id === id2 ? { ...item, isFlipped: false } : item
      )
    );
  };

  const resetFlips = () => {
    setFlippedItemIds([]);
  };

  // Check for matches whenever flippedItemIds changes
  useEffect(() => {
    if (flippedItemIds.length !== 2) return;

    const [id1, id2] = flippedItemIds;
    const item1 = gameItems.find((item) => item.id === id1);
    const item2 = gameItems.find((item) => item.id === id2);

    if (!item1 || !item2) return; // Should not happen, but safety check

    if (item1.pairId === item2.pairId) {
      // Matched!
      // Optional: Add a small visual cue like confetti or highlight
      // confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
      // Use setTimeout to allow user to see the match before items might visually change
      setTimeout(() => {
        markAsMatched(id1, id2);
        resetFlips();
      }, 300); // Short delay
    } else {
      // Not a match: flip back after a delay
      setTimeout(() => {
        flipBack(id1, id2);
        resetFlips();
      }, 800); // Longer delay to see the mismatch
    }
  }, [flippedItemIds, gameItems]); // Rerun when flipped items or game items change

  // Handle item click
  const handleItemClick = (id: string) => {
    if (!gameActive) return;

    const clickedItem = gameItems.find((item) => item.id === id);

    // Prevent clicking on already matched items or more than 2 items
    if (
      !clickedItem ||
      clickedItem.isMatched ||
      clickedItem.isFlipped || // Prevent clicking already flipped item
      flippedItemIds.length >= 2
    ) {
      return;
    }

    // Flip the item
    setGameItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, isFlipped: true } : item
      )
    );

    // Add to flipped items
    setFlippedItemIds((prev) => [...prev, id]);
  }
  
  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }
  
  return (
    <div className="h-full flex flex-col p-6">
      {/* Game stats */}
      <div className="flex justify-between items-center px-4 py-3 bg-gradient-to-r from-muted/30 via-transparent to-muted/30 rounded-xl mb-8">
        <div className="flex-1">
          <div className="flex justify-between items-center text-sm font-medium mb-1.5">
            <p>Progress & Waktu</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4">
                <p>
                  <span className="text-primary font-bold">{matchedPairCount}</span>
                  <span className="text-muted-foreground">/{pairCount}</span>
                </p>
                <span className="font-mono">
                  {formatTime(timeRemaining)}
                </span>
                <span className="border-l border-border/50 h-6" />
                <span className="font-bold text-xl text-primary">{score}</span>
              </div>
            </div>
          </div>
          <Progress 
            value={(timeRemaining / timeLimit) * 100} 
            className="h-2.5"
          />
        </div>
      </div>
      
      {/* Game board */}
      <div className="flex-grow flex items-center justify-center px-2">
        {/* Always 4 columns on mobile, adjust for medium screens based on count */}
        <div className={cn(
          "grid gap-2 md:gap-3 place-items-center mx-auto",
          "grid-cols-4 max-w-[360px]", // Base: 4 columns for mobile
          pairCount <= 8 ? "md:max-w-[520px]" : "md:grid-cols-5 md:max-w-[650px]" // Medium+ screens: 4 cols for easy/medium, 5 for hard
        )}>
        {gameItems.map((item) => (
          <div
            key={item.id}
            className={cn(
              "w-[84px] h-[100px] md:w-[100px] md:h-[120px] [perspective:1000px] group transition-all duration-200 ease-out", // Increased base size for mobile
              !item.isMatched && "cursor-pointer hover:-translate-y-1 hover:scale-[1.02]",
              item.isMatched && "cursor-default" // Change cursor for matched cards
            )}
            onClick={() => handleItemClick(item.id)}
            role="button"
            tabIndex={item.isMatched ? -1 : 0} // Remove from tab order when matched
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleItemClick(item.id)}
            aria-label={`Card: ${item.content}. Click to flip.`}
          >
            <div
              className={cn(
                "relative w-full h-full transition-all duration-300 ease-in-out [transform-style:preserve-3d]",
                item.isFlipped ? "[transform:rotateY(180deg)]" : "[transform:rotateY(0deg)]"
                // Removed: card.isMatched && "opacity-60"
              )}
            >
              {/* Front side (Question mark) */}
              <div
                className={cn(
                  "absolute w-full h-full [backface-visibility:hidden]",
                  "flex items-center justify-center text-center",
                  "rounded-lg shadow-md",
                  "border-2 border-primary/30 bg-gradient-to-br from-primary to-primary/90",
                  "group-hover:shadow-lg group-hover:shadow-primary/20 transition-all"
                )}
              >
                <Image 
                  src="/images/circle-logo.png"
                  alt="Card logo"
                  width={76}
                  height={64}
                  className="text-primary-foreground"
                />
              </div>

              {/* Back side (Content) */}
              <div
                className={cn(
                  "absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]",
                  "flex items-center justify-center text-center p-2",
                  "rounded-lg shadow-md",
                  item.isMatched
                    ? "bg-primary/10 border-2 border-primary opacity-75" // Keep distinct style, maybe add slight opacity here?
                    : "bg-card border-2 border-border/50",
                  !item.isMatched && "group-hover:shadow-lg group-hover:shadow-accent/20 transition-all" // Disable hover shadow if matched
                )}
              >
                <p
                  className={cn(
                    "text-sm md:text-base leading-tight font-bold",
                    item.type === "korean"
                      ? "text-primary"
                      : "text-accent-foreground"
                  )}
                >
                  {item.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
        </div>
    </div>
  )
}
