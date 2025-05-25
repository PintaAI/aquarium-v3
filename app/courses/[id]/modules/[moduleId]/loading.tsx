"use client";
import { Skeleton } from "@/components/ui/skeleton"

export default function ModuleLoading() {
  return (
    <div className="w-full mx-auto p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Main Content */}
        <div className="space-y-3 sm:space-y-4 flex-1">
          {/* Header Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-8 w-3/4" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          
          {/* Content Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>

          {/* Button Skeleton */}
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Sidebar Skeleton */}
        <div className="lg:w-[330px] w-full space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
