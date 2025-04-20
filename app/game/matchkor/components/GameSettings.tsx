"use client";

import { useState, useEffect } from "react"; // Add useEffect
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { getCollections } from "../actions/get-match-words"; // Import the action
import { Layers, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
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
  const [selectedCollectionTitle, setSelectedCollectionTitle] = useState<string>("Acak"); // State for selected collection title

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
    // Close the dialog after selection
    document.querySelector('[role="dialog"]')?.closest('dialog')?.close();
  };

  // Difficulty settings remain, but descriptions might be less specific about pair count now
  const difficultySettings = {
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
  }

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
      <div className="max-w-md mx-auto">
        <Label className="text-sm font-medium mb-2 block">Koleksi Kosakata</Label>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between group bg-white dark:bg-background hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 hover:shadow-sm border-slate-200 dark:border-slate-700 py-3"
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
        <Label className="text-sm font-medium mb-2 block">Tingkat Kesulitan</Label> {/* Added Label */}
        <RadioGroup
          value={difficulty}
          onValueChange={(value) => setDifficulty(value as "easy" | "medium" | "hard")} 
          className="space-y-4"
        >
          {Object.entries(difficultySettings).map(([key, value]) => (
            <div 
              key={key}
              className={`flex items-start space-x-3 border p-4 rounded-lg hover:bg-accent/50 transition-colors ${
                difficulty === key ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <RadioGroupItem value={key} id={key} className="mt-1" />
              <div className="flex-1">
                <Label htmlFor={key} className="text-base font-medium">
                  {key === "easy" ? "Mudah" : key === "medium" ? "Sedang" : "Sulit"}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">{value.description}</p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium">Jumlah kartu:</span> {value.pairs * 2}
                  </div>
                  <div>
                    <span className="font-medium">Waktu:</span> {value.timeLimit}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="flex justify-center mt-8">
        <Button
          onClick={() => onStart(difficulty, selectedCollectionId)} // Pass selectedCollectionId
          size="lg"
          className="px-8"
          disabled={loadingCollections || !!collectionError} // Disable if loading or error
        >
          {loadingCollections ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} {/* Add loading indicator */}
          Mulai Permainan
        </Button>
      </div>
    </motion.div>
  )
}
