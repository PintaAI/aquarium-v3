"use client";

import Link from "next/link";
import React from "react";
import { SearchResult } from "@/app/actions/search-actions";
import { cn } from "@/lib/utils";
import { Book, Gamepad2, Newspaper, BookText } from "lucide-react";

interface SearchResultsProps {
  results: SearchResult[];
  onClose?: () => void;
}

export function SearchResults({ results, onClose }: SearchResultsProps) {
  if (results.length === 0) return null;

  const TypeIcon = {
    article: Newspaper,
    course: Book,
    game: Gamepad2,
    vocabulary: BookText,
  };

  return (
    <div className="absolute inset-x-0 top-full mt-2 bg-background border rounded-lg shadow-lg z-50 max-h-[60vh] overflow-y-auto">
      <div className="p-2">
        {results.map((result) => {
          const Icon = TypeIcon[result.type];
          return (
            <Link
              key={`${result.type}-${result.id}`}
              href={result.url}
              onClick={onClose}
              className={cn(
                "flex items-center gap-2 p-2 hover:bg-accent rounded-md transition-colors",
                "text-sm font-medium",
              )}
            >
              <Icon className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <span>{result.title}</span>
                {result.subtitle && (
                  <span className="block text-xs text-muted-foreground">
                    {result.subtitle}
                  </span>
                )}
              </div>
              <span className="ml-auto text-xs text-muted-foreground capitalize">
                {result.type}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
