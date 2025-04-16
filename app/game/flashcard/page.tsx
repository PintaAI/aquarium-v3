"use client";

import { useState } from "react";
import FlashcardGame from "./components/FlashcardGame";
import { StartScreen } from "./components/StartScreen";

export default function FlashcardPage() {
  const [selectedCollection, setSelectedCollection] = useState<number | undefined>();
  const [isGameStarted, setIsGameStarted] = useState(false);

  const handleCollectionSelect = (collectionId: number | undefined) => {
    setSelectedCollection(collectionId);
    setIsGameStarted(true);
  };

  const handleReturn = () => {
    setIsGameStarted(false);
    setSelectedCollection(undefined);
  };

  return (
    <div className="flex items-center justify-center h-full pb-24">
      <div className="w-full max-w-3xl">
        {!isGameStarted ? (
          <StartScreen onSelectCollection={handleCollectionSelect} />
        ) : (
          <FlashcardGame
            collectionId={selectedCollection}
            onReturn={handleReturn}
          />
        )}
      </div>
    </div>
  );
}
