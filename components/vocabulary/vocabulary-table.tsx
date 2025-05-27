"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EyeIcon, EyeOffIcon, MinusIcon, PlusIcon, ShuffleIcon, SearchIcon } from "lucide-react";
import { PiSwapDuotone } from "react-icons/pi";
import { startTransition, useOptimistic, useState, useMemo } from "react";
import { toggleVocabularyItemCheck } from "@/app/actions/vocabulary-actions";
import { toast } from "sonner";

interface VocabularyItem {
  id: number;
  korean: string;
  indonesian: string;
  isChecked: boolean;
  collectionId: number;
  createdAt: Date;
  updatedAt: Date;
 
}

interface VocabularyTableProps {
  items: VocabularyItem[];
}

export function VocabularyTable({ items: initialItems }: VocabularyTableProps) {
  const [isMeaningHidden, setIsMeaningHidden] = useState(true);
  const [revealedItems, setRevealedItems] = useState<Record<number, boolean>>({});
  const [isRandomOrder, setIsRandomOrder] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [fontSize, setFontSize] = useState(16);
  const [showKoreanFirst, setShowKoreanFirst] = useState(true);
  const [orderedItems, setOrderedItems] = useState(initialItems);

  // Keep track of checked state without reordering
  const [checkedStates, setCheckedStates] = useOptimistic<Record<number, boolean>>(
    Object.fromEntries(initialItems.map(item => [item.id, item.isChecked]))
  );

  // Calculate progress
  const progress = useMemo(() => {
    const checkedCount = Object.values(checkedStates).filter(Boolean).length;
    return Math.round((checkedCount / initialItems.length) * 100);
  }, [checkedStates, initialItems.length]);

  // Filter and randomize items
  const filteredItems = useMemo(() => {
    const items = orderedItems.filter(item =>
      searchQuery ? 
        item.korean.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.indonesian.toLowerCase().includes(searchQuery.toLowerCase())
      : true
    );
    return isRandomOrder ? [...items].sort(() => Math.random() - 0.5) : items;
  }, [orderedItems, searchQuery, isRandomOrder]);

  const increaseFontSize = () => setFontSize(prev => Math.min(prev + 2, 24));
  const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 2, 12));

  const toggleItem = async (id: number) => {
    startTransition(() => {
      setCheckedStates(prev => ({
        ...prev,
        [id]: !prev[id]
      }));
      setOrderedItems(prev => prev.map(item => item.id === id ? { ...item, isChecked: !item.isChecked } : item));
    });

    const result = await toggleVocabularyItemCheck(id);
    if (!result.success) {
      // Revert on error
      startTransition(() => {
        setCheckedStates(prev => ({
          ...prev,
          [id]: !prev[id]
        }));
        setOrderedItems(prev => prev.map(item => item.id === id ? { ...item, isChecked: !item.isChecked } : item));
      });
      toast.error(result.error || "Gagal mengupdate status");
    }
  };

  return (
    <div className="relative rounded-lg  overflow-x-auto min-h-[200px]">
      <div className="p-2 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari kosakata..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsRandomOrder(prev => !prev)}
            className={isRandomOrder ? "bg-primary/10" : ""}
          >
            <ShuffleIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowKoreanFirst(prev => !prev)}
            className={!showKoreanFirst ? "bg-primary/10" : ""}
          >
            <PiSwapDuotone className="h-6 w-6" />
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          <Progress value={progress} className="h-2" />
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {progress}%
          </span>
        </div>
      </div>
      
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead className="w-[calc(50%-50px)] text-sm sm:text-base text-center">
              {showKoreanFirst ? "Korea" : "Indonesia"}
            </TableHead>
            <TableHead className="w-[calc(50%-50px)] text-sm sm:text-base text-center">
              {showKoreanFirst ? "Indonesia" : "Korea"}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredItems.map((item, index) => (
            <TableRow 
              key={item.id} 
              className={`${index % 2 === 0 ? 'bg-muted/30' : ''}`}
            >
              <TableCell className="w-[50px]">
                <Checkbox
                  checked={checkedStates[item.id]}
                  onCheckedChange={() => toggleItem(item.id)}
                />
              </TableCell>
              <TableCell 
                style={{ fontSize: `${fontSize}px` }}
                className={`font-medium text-center ${
                  showKoreanFirst ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'
                } ${checkedStates[item.id] ? "line-through" : ""}`}
              >
                {showKoreanFirst ? item.korean : item.indonesian}
              </TableCell>
              <TableCell 
                onClick={() => setRevealedItems(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                style={{ fontSize: `${fontSize}px` }}
                className={`text-center ${
                  isMeaningHidden && !revealedItems[item.id]
                    ? "text-muted-foreground cursor-pointer hover:bg-muted/50" 
                    : showKoreanFirst ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'
                } ${checkedStates[item.id] ? "line-through" : ""}`}
              >
                {isMeaningHidden && !revealedItems[item.id] ? (
              <span className="italic text-center block">• • •</span>
                ) : (
                  showKoreanFirst ? item.indonesian : item.korean
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="fixed bottom-24 md:right-20 left-1/2 md:left-auto transform -translate-x-1/2 md:translate-x-0 flex gap-2 z-50">
        <Button 
          variant="secondary" 
          size="sm"
          onClick={decreaseFontSize}
          className="shadow-lg rounded-full w-10 h-10 md:w-12 md:h-12 p-0"
        >
          <MinusIcon className="h-4 w-4" />
        </Button>
        <Button 
          variant="secondary" 
          size="sm"
          onClick={increaseFontSize}
          className="shadow-lg rounded-full w-10 h-10 md:w-12 md:h-12 p-0"
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
        <Button 
          variant="secondary" 
          size="sm"
          onClick={() => {
            setIsMeaningHidden(!isMeaningHidden);
            setRevealedItems({}); // Reset individual reveals when toggling global visibility
          }}
          className="shadow-lg flex items-center gap-2 rounded-full h-10 md:h-12 px-4 md:px-6"
        >
          {isMeaningHidden ? (
            <>
              <EyeIcon className="h-4 w-4" />
              <span>Lihat {showKoreanFirst ? "Arti" : "한국어"}</span>
            </>
          ) : (
            <>
              <EyeOffIcon className="h-4 w-4" />
              <span>Tutup</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
