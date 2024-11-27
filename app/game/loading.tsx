"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Game Area Skeleton */}
      <Card className="max-w-3xl mx-auto">
        <CardContent className="p-8">
          {/* Game Title Skeleton */}
          <Skeleton className="h-8 w-[200px] mx-auto mb-8" />
          
          {/* Game Content Area Skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-[300px] w-full rounded-lg" />
            
            {/* Game Controls Skeleton */}
            <div className="flex justify-center gap-4 mt-6">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
