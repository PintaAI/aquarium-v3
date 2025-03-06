"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchBoxProps {
  placeholder?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function SearchBox({ placeholder = "Search...", onChange, className = "" }: SearchBoxProps) {
  return (
    <div className={cn("relative group", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 text-primary -translate-y-1/2 transition-colors duration-200 group-hover:text-foreground dark:text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(
          "pl-9 w-full transition-all duration-200",
          "bg-background/60 hover:bg-background/80 focus:bg-background",
          "border border-border/40 hover:border-border/60 focus:border-border",
          "shadow-sm hover:shadow-md focus:shadow-md",

          "placeholder:text-muted-foreground/70",
          "focus-visible:ring-1 focus-visible:ring-ring/30"
        )}
      />
    </div>
  );
}
