import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <Button asChild variant="ghost" className="mb-6 text-primary hover:text-primary/90">
        <Link href="/courses" className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Course Header Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-[200px] w-full rounded-lg" /> {/* Thumbnail */}
            <div className="space-y-2">
              <Skeleton className="h-8 w-3/4" /> {/* Title */}
              <div className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" /> {/* Author avatar */}
                <Skeleton className="h-4 w-32" /> {/* Author name */}
              </div>
              <div className="flex space-x-4">
                <Skeleton className="h-6 w-20" /> {/* Level */}
                <Skeleton className="h-6 w-24" /> {/* Module count */}
              </div>
            </div>
          </div>
          
          {/* Course Description Skeleton */}
          <div className="mt-6 space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>

        {/* Module List Skeleton */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            <Skeleton className="h-8 w-48" /> {/* Module list title */}
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
