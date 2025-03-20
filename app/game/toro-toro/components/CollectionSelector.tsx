"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getVocabularyCollections } from "@/app/actions/vocabulary-actions";

interface Collection {
  id: number;
  title: string;
}

interface CollectionSelectorProps {
  onSelect: (collectionId?: number) => void;
}

export const CollectionSelector = ({ onSelect }: CollectionSelectorProps) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selected, setSelected] = useState<string>("random");

  useEffect(() => {
    const loadCollections = async () => {
      const result = await getVocabularyCollections();
      if (result.success && result.data) {
        setCollections(result.data.map(c => ({
          id: c.id,
          title: c.title
        })));
      }
    };
    loadCollections();
  }, []);

  const handleSelect = (value: string) => {
    setSelected(value);
    onSelect(value === "random" ? undefined : Number(value));
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col items-center space-y-2">
        <p className="text-sm text-muted-foreground">Pilih kosa kata untuk bermain</p>
      </div>
      
      <Select value={selected} onValueChange={handleSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Choose vocabulary collection" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="random">Random Words</SelectItem>
          {collections.map(collection => (
            <SelectItem key={collection.id} value={collection.id.toString()}>
              {collection.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
