"use client";

import { useEffect, useState } from "react";
import { Layers } from "lucide-react"; // Import an icon
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { VocabularyCard } from "@/components/card/vocabulary-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getCollections } from "../actions/get-flashcard-words";

interface Collection {
  id: number;
  title: string;
  icon: string | null;
  _count: {
    items: number;
  };
}

interface CollectionSelectorProps {
  onSelect: (collectionId: number | undefined) => void;
}

export default function CollectionSelector({ onSelect }: CollectionSelectorProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCollections() {
      try {
        const result = await getCollections();
        if (!result.success) {
          throw new Error(result.error);
        }
        // Only show collections that have words
        const collectionsWithWords = (result.data || []).filter(c => c._count.items > 0);
        setCollections(collectionsWithWords);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load collections");
      } finally {
        setLoading(false);
      }
    }

    loadCollections();
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {/* Add some visual interest with an icon and slight animation on hover */}
        <Button 
          variant="outline" 
          className="w-full justify-between group bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 hover:shadow-sm border-slate-200 dark:border-slate-700 py-5"
        >
          <span className="flex items-center gap-3">
            <span className="relative">
              <Layers className="h-5 w-5 text-blue-500 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" />
              <span className="absolute inset-0 animate-ping opacity-20 bg-blue-500 rounded-full duration-1000" />
            </span>
            <span className="font-medium">Pilih Koleksi Kosakata</span>
          </span>
          {loading ? (
            <span className="text-muted-foreground">Loading...</span>
          ) : error ? (
            <span className="text-red-500">Error</span>
          ) : (
            <span className="text-muted-foreground">
              {collections.length} koleksi tersedia
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Pilih Koleksi Kosakata</DialogTitle>
        </DialogHeader>
        <ScrollArea className="mt-4 max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
            <div 
              className="cursor-pointer" 
              onClick={() => {
                onSelect(undefined);
                document.querySelector('[role="dialog"]')?.closest('dialog')?.close();
              }}
            >
              <VocabularyCard
                title="Acak 100 Kata"
                description="Kosakata acak dari semua koleksi"
                items={[]}
                icon="FaDice"
              />
            </div>
            {collections.map((collection) => (
              <div 
                key={collection.id} 
                className="cursor-pointer" 
                onClick={() => {
                  onSelect(collection.id);
                  document.querySelector('[role="dialog"]')?.closest('dialog')?.close();
                }}
              >
                <VocabularyCard
                  title={collection.title}
                  items={[{ isChecked: false }]} // Dummy item for the card
                  icon={collection.icon || "FaBook"}
                  description={`${collection._count.items} kata`}
                />
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
