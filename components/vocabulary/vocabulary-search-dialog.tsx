"use client";

import { searchVocabularyItems } from "@/actions/vocabulary-actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SearchIcon } from "lucide-react";
import { useState } from "react";

interface VocabularyItem {
  id: number;
  korean: string;
  indonesian: string;
  collectionId: number;
  collection: {
    title: string;
  };
}

export function VocabularySearchDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<VocabularyItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    try {
      const { success, data, error } = await searchVocabularyItems(searchTerm);
      if (success && data) {
        setResults(data);
      } else {
        console.error("Search failed:", error);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSearchTerm("");
      setResults([]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <SearchIcon className="h-4 w-4" />
          Cari Kosakata
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Cari Kosakata</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 my-4">
          <Input
            placeholder="Cari dalam bahasa Korea atau Indonesia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1"
            autoFocus
          />
          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? "Mencari..." : "Cari"}
          </Button>
        </div>
        <ScrollArea className="relative rounded-md border max-h-[400px]">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-[40%]">Korea</TableHead>
                <TableHead className="w-[40%]">Indonesia</TableHead>
                <TableHead className="w-[20%]">Koleksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    {searchTerm ? "Tidak ada hasil" : "Cari kosakata di semua koleksi"}
                  </TableCell>
                </TableRow>
              ) : (
                results.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-emerald-600 dark:text-emerald-400">
                      {item.korean}
                    </TableCell>
                    <TableCell className="text-blue-600 dark:text-blue-400">
                      {item.indonesian}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.collection.title}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
