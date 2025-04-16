"use client";

import { useEffect, useState } from "react";
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
        <Button variant="outline" className="w-full justify-between">
          <span>Pilih Koleksi Kosakata</span>
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
