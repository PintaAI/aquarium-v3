"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { SearchResults } from "./search-results";
import { SearchResult, searchContent } from "@/app/actions/search-actions";
import { useDebouncedCallback } from "use-debounce";

interface SearchBoxProps {
  placeholder?: string;
  className?: string;
}

export function SearchBox({ placeholder = "Search...", className = "" }: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebouncedCallback(async (value: string) => {
    if (value.trim()) {
      const searchResults = await searchContent(value);
      setResults(searchResults);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, 300);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setQuery("");
  }, []);

  return (
    <div ref={wrapperRef} className={cn("relative group", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 text-primary -translate-y-1/2 transition-colors duration-200 group-hover:text-foreground dark:text-muted-foreground" />
      <Input
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={handleChange}
        className={cn(
          "pl-9 w-full transition-all duration-200",
          "bg-background/60 hover:bg-background/80 focus:bg-background",
          "border border-border/40 hover:border-border/60 focus:border-border",
          "shadow-sm hover:shadow-md focus:shadow-md",
          "placeholder:text-muted-foreground/70",
          "focus-visible:ring-1 focus-visible:ring-ring/30"
        )}
      />
      {isOpen && <SearchResults results={results} onClose={handleClose} />}
    </div>
  );
}
