"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EyeIcon, EyeOffIcon, MinusIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

interface VocabularyItem {
  id: number;
  korean: string;
  indonesian: string;
  collectionId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface VocabularyTableProps {
  items: VocabularyItem[];
}

export function VocabularyTable({ items }: VocabularyTableProps) {
  const [isMeaningHidden, setIsMeaningHidden] = useState(true);
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [fontSize, setFontSize] = useState(16); // base font size in pixels

  const increaseFontSize = () => setFontSize(prev => Math.min(prev + 2, 24));
  const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 2, 12));

  const toggleItem = (id: number) => {
    setCheckedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="relative rounded-lg border overflow-x-auto min-h-[200px]">
      
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead className="w-[calc(50%-50px)] text-sm sm:text-base">Korea</TableHead>
            <TableHead className="w-[calc(50%-50px)] text-sm sm:text-base">Indonesia</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow 
              key={item.id} 
              className={`${index % 2 === 0 ? 'bg-muted/30' : ''}`}
            >
              <TableCell className="w-[50px]">
                <Checkbox
                  checked={checkedItems.includes(item.id)}
                  onCheckedChange={() => toggleItem(item.id)}
                />
              </TableCell>
              <TableCell 
                style={{ fontSize: `${fontSize}px` }}
                className={`font-medium text-emerald-600 dark:text-emerald-400 ${
                  checkedItems.includes(item.id) ? "line-through" : ""
                }`}
              >
                {item.korean}
              </TableCell>
              <TableCell 
                style={{ fontSize: `${fontSize}px` }}
                className={`${
                  isMeaningHidden 
                    ? "text-muted-foreground" 
                    : "text-blue-600 dark:text-blue-400"
                } ${
                  checkedItems.includes(item.id) ? "line-through" : ""
                }`}
              >
                {isMeaningHidden ? (
                  <span className="italic">• • •</span>
                ) : (
                  item.indonesian
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="fixed bottom-24 right-20 flex gap-2 z-50">
        <Button 
          variant="secondary" 
          size="sm"
          onClick={decreaseFontSize}
          className="shadow-lg rounded-full w-10 h-10 p-0"
        >
          <MinusIcon className="h-4 w-4" />
        </Button>
        <Button 
          variant="secondary" 
          size="sm"
          onClick={increaseFontSize}
          className="shadow-lg rounded-full w-10 h-10 p-0"
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
        <Button 
          variant="secondary" 
          size="sm"
          onClick={() => setIsMeaningHidden(!isMeaningHidden)}
          className="shadow-lg flex items-center gap-2 rounded-full"
        >
          {isMeaningHidden ? (
            <>
              <EyeIcon className="h-4 w-4" />
              <span>Lihat Arti</span>
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
