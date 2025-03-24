"use client"

import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-0 sm:p-4 pb-24">
      {/* Breadcrumb Skeleton */}
      <div className="px-4">
        <Skeleton className="h-5 w-[200px]" />
      </div>
      <div className="container mx-auto py-6 max-w-7xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-44" /> {/* "Daftar Artikel" */}
          </div>

          {/* Articles List */}
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border p-2">
                <Skeleton className="mt-1 h-10 w-10 rounded-full shrink-0" /> {/* Avatar */}
                <div className="space-y-1 flex-1 min-w-0">
                  <Skeleton className="h-5 w-3/4" /> {/* Title */}
                  <Skeleton className="h-4 w-full hidden sm:block" /> {/* Description */}
                  <div className="flex items-center gap-2 pt-1 sm:pt-2">
                    <Skeleton className="h-3 w-20" /> {/* Author name */}
                    <span className="text-xs text-muted-foreground/60">•</span>
                    <Skeleton className="h-3 w-24" /> {/* Time */}
                  </div>
                </div>
                <div className="shrink-0 rounded-md border bg-muted/30 w-16 h-16 sm:w-20 sm:h-20" /> {/* Image */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
