"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header Skeleton */}
      <header className="text-center space-y-4">
        <Skeleton className="h-10 w-[300px] mx-auto" />
        <Skeleton className="h-4 w-[600px] mx-auto" />
      </header>

      {/* Search Skeleton */}
      <div className="max-w-md mx-auto">
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Articles Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-6">
              {/* Thumbnail Skeleton */}
              <Skeleton className="w-full h-48 mb-4" />
              
              {/* Title Skeleton */}
              <Skeleton className="h-6 w-3/4 mb-2" />
              
              {/* Description Skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>

              {/* Meta Info Skeleton */}
              <div className="flex items-center gap-4 mt-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
