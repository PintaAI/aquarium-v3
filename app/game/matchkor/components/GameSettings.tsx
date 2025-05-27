"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { getCollections, getMatchWords } from "../actions/get-match-words"; // Import both actions
import { Layers, Loader2, AlertTriangle, CheckCircle, Flame, Dumbbell, Swords } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VocabularyCard } from "@/components/card/vocabulary-card"; // Reuse VocabularyCard

// Define Collection type based on the action's return type
interface Collection {
  id: number;
  title: string;
  icon: string | null;
  _count: {
    items: number;
  };
}

interface GameSettingsProps {
  // Update onStart to accept collectionId
  onStart: (difficulty: "easy" | "medium" | "hard", collectionId?: number) => void;
}

export default function GameSettings({ onStart }: GameSettingsProps) {
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [collections, setCollections] = useState<Collection[]>([]); // State for collections
  const [loadingCollections, setLoadingCollections] = useState(true); // Loading state
  const [collectionError, setCollectionError] = useState<string | null>(null); // Error state
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | undefined>(undefined); // State for selected collection ID (undefined = random)
  const [selectedCollectionTitle, setSelectedCollectionTitle] = useState<string>("Acak");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [wordPairs, setWordPairs] = useState<Array<{ id: string; content: string; type: string; pairId: number }>>([]);
  const [loadingPairs, setLoadingPairs] = useState(false);

  // Memoize difficulty settings to prevent recreation on every render
  const difficultySettings = useMemo(() => ({
    easy: {
      pairs: 6, // Example pair count for logic, actual count determined later
      timeLimit: "1 menit 30 detik",
      description: "Cocokkan pasangan kata dasar"
    },
    medium: {
      pairs: 8, // Example pair count
      timeLimit: "2 menit",
      description: "Tantangan mencocokkan yang seimbang"
    },
    hard: {
      pairs: 10, // Example pair count
      timeLimit: "2 menit 30 detik",
      description: "Uji kecepatan dan ingatan kosakatamu"
    }
  }), []);

  // Fetch word pairs when collection or difficulty changes
  useEffect(() => {
    async function fetchWordPairs() {
      setLoadingPairs(true);
      try {
        const pairCount = difficultySettings[difficulty].pairs;
        const result = await getMatchWords(pairCount, selectedCollectionId);
        if (result.success) {
          setWordPairs(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch word pairs:", error);
      } finally {
        setLoadingPairs(false);
      }
    }
    fetchWordPairs();
  }, [selectedCollectionId, difficulty, difficultySettings]);

  // Group word pairs by pairId for aligned preview
  const groupedWordPairs = useMemo(() => {
    const pairsMap = new Map<number, { korean?: string; indonesian?: string }>();
    wordPairs.forEach(word => {
      const existingPair = pairsMap.get(word.pairId) || {};
      if (word.type === 'korean') {
        existingPair.korean = word.content;
      } else if (word.type === 'indonesian') {
        existingPair.indonesian = word.content;
      }
      pairsMap.set(word.pairId, existingPair);
    });
    // Convert map to array of objects with pairId, sorting by pairId for consistent order
    return Array.from(pairsMap.entries())
      .sort(([a], [b]) => a - b) // Sort by pairId
      .map(([pairId, words]) => ({
        pairId,
        korean: words.korean || '?', // Handle missing words gracefully
        indonesian: words.indonesian || '?',
      }));
  }, [wordPairs]);

  // useEffect to fetch collections on mount
  useEffect(() => {
    async function loadCollections() {
      setLoadingCollections(true); // Start loading
      setCollectionError(null);
      try {
        // Fetch collections suitable for the game (at least 3 pairs needed for easy mode)
        const result = await getCollections();
        if (!result.success) {
          throw new Error(result.error || "Failed to load collections");
        }
        setCollections(result.data || []); // Set fetched collections
      } catch (err) {
        setCollectionError(err instanceof Error ? err.message : "An unknown error occurred"); // Set error message
      } finally {
        setLoadingCollections(false); // Finish loading
      }
    }
    loadCollections(); // Call the function
  }, []); // Empty dependency array means run once on mount

  // Handler function for selecting a collection
  const handleCollectionSelect = (id: number | undefined, title: string) => {
    setSelectedCollectionId(id);
    setSelectedCollectionTitle(title);
    setDialogOpen(false); // Close dialog using state
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 py-4"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">Pengaturan Permainan</h2>
        <p className="text-muted-foreground mt-2">Pilih koleksi kosakata dan tingkat kesulitan</p> {/* Updated text */}
      </div>

      {/* Collection Selector UI */}
      <div className="max-w-md  mx-2 md:mx-auto">
        <Label className="text-sm font-medium mb-2 block">Koleksi Kosakata</Label>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between group bg-white dark:bg-background hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 hover:shadow-sm border-slate-200 dark:border-slate-700 py-3  "
              disabled={loadingCollections}
            >
              <span className="flex items-center gap-3">
                <span className="relative">
                  <Layers className="h-5 w-5 text-blue-500 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" />
                  {loadingCollections && <span className="absolute inset-0 animate-ping opacity-50 bg-blue-500 rounded-full duration-1000" />}
                </span>
                <span className="font-medium truncate pr-2">
                  {loadingCollections ? "Memuat Koleksi..." : collectionError ? "Gagal Memuat" : selectedCollectionTitle}
                </span>
              </span>
              {loadingCollections ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : collectionError ? (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              ) : (
                 <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl border-none p-0">
            <DialogHeader>
              <DialogTitle className="mt-4 p-0 md:ml-4 ml-0 ">Pilih Koleksi</DialogTitle>
            </DialogHeader>
            <ScrollArea className="mt-2 max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
                {/* Random Option */}
                <div
                  className={`cursor-pointer rounded-lg border-2 p-1 transition-colors ${
                    selectedCollectionId === undefined
                      ? 'border-primary bg-primary/5' // Selected style
                      : 'border-transparent hover:border-border' // Default style
                  }`}
                  onClick={() => handleCollectionSelect(undefined, "Acak")}
                >
                  <VocabularyCard
                    title="Acak"
                    description="Kata acak dari semua koleksi"
                    items={[]}
                    icon="FaDice"
                    // isSelected prop removed
                  />
                </div>
                {/* Fetched Collections */}
                {collections.map((collection) => (
                  <div
                    key={collection.id}
                    className={`cursor-pointer rounded-lg border-2 p-1 transition-colors ${
                      selectedCollectionId === collection.id
                        ? 'border-primary bg-primary/5' // Selected style
                        : 'border-transparent hover:border-border' // Default style
                    }`}
                    onClick={() => handleCollectionSelect(collection.id, collection.title)}
                  >
                    <VocabularyCard
                      title={collection.title}
                      description={`${collection._count.items} kata`}
                      items={[{ isChecked: false }]} // Dummy item
                      icon={collection.icon || "FaBook"}
                      // isSelected prop removed
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
         {collectionError && <p className="text-sm text-red-500 mt-2">{collectionError}</p>}
      </div>

      {/* Difficulty Selector */}
      <div className="max-w-md mx-auto">
        <Label className="text-sm font-medium mb-4 block text-center">Tingkat Kesulitan</Label>
        <RadioGroup
          value={difficulty}
          onValueChange={(value) => setDifficulty(value as "easy" | "medium" | "hard")}
          className="flex justify-center gap-4"
        >
          {Object.entries(difficultySettings).map(([key, value]) => (
            <div
              key={key}
              className="relative"
            >
              <RadioGroupItem value={key} id={key} className="peer sr-only" />
              <Label
                htmlFor={key}
                className={`
                  flex flex-col items-center justify-center p-4 min-w-[100px]
                  border-2 rounded-lg cursor-pointer transition-all duration-300
                  ${key === 'easy' 
                    ? 'hover:bg-green-50 dark:hover:bg-green-950 ' + (difficulty === 'easy' ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-border')
                    : key === 'medium'
                    ? 'hover:bg-yellow-50 dark:hover:bg-yellow-950 ' + (difficulty === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950' : 'border-border')
                    : 'hover:bg-red-50 dark:hover:bg-red-950 ' + (difficulty === 'hard' ? 'border-red-500 bg-red-50 dark:bg-red-950' : 'border-border')
                  }
                `}
              >
                {key === 'easy' ? (
                  <Dumbbell className="w-6 h-6 mb-2 text-green-500" />
                ) : key === 'medium' ? (
                  <Flame className="w-6 h-6 mb-2 text-yellow-500" />
                ) : (
                  <Swords className="w-6 h-6 mb-2 text-red-500" />
                )}
                <span className={`text-base font-medium mb-1 ${
                  key === 'easy' 
                    ? 'text-green-700 dark:text-green-300'
                    : key === 'medium'
                    ? 'text-yellow-700 dark:text-yellow-300'
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  {key === "easy" ? "Mudah" : key === "medium" ? "Sedang" : "Sulit"}
                </span>
                <span className="text-xs text-muted-foreground">{value.timeLimit}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
        <p className={`text-xs text-center mt-4 ${
          difficulty === 'easy' 
            ? 'text-green-600 dark:text-green-400'
            : difficulty === 'medium'
            ? 'text-yellow-600 dark:text-yellow-400'
            : 'text-red-600 dark:text-red-400'
        }`}>
          {difficultySettings[difficulty].description}
        </p>
      </div>

      {/* Start Game Button */}
      <div className="flex justify-center mt-8">
        <Button
          onClick={() => onStart(difficulty, selectedCollectionId)}
          size="lg"
          className="px-8"
          disabled={loadingCollections || !!collectionError || loadingPairs}
        >
          {(loadingCollections || loadingPairs) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Mulai Permainan
        </Button>
      </div>

      {/* Word Pairs Preview */}
      {wordPairs.length > 0 && (
        <div className="max-w-2xl mx-auto mt-8 px-4 mb-24 md:mb-0">
          <div className="text-center mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Kata-kata yang akan dimainkan ({groupedWordPairs.length} pasang):
            </h3>
          </div>
          {/* Aligned Word Pair Preview */}
          <div className="space-y-2">
             <div className="flex justify-between gap-4 mb-2">
                <p className="text-xs font-medium text-center flex-1 text-muted-foreground">Korea</p>
                <p className="text-xs font-medium text-center flex-1 text-muted-foreground">Indonesia</p>
             </div>
            {groupedWordPairs.map(pair => (
              <div key={pair.pairId} className="flex justify-between gap-4">
                {/* Korean Word */}
                <div className="p-2 rounded-md bg-accent/50 text-center text-sm flex-1 truncate">
                  {pair.korean}
                </div>
                {/* Indonesian Word */}
                <div className="p-2 rounded-md bg-accent/50 text-center text-sm flex-1 truncate">
                  {pair.indonesian}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
