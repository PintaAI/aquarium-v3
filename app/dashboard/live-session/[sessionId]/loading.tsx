import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingLiveSession() {
  return (
    <div className="container mx-auto p-6">
      {/* Header Skeleton */}
      <div className="mb-8 flex items-center justify-between">
        <Skeleton className="h-10 w-[300px]" />
        <Skeleton className="h-6 w-[100px]" />
      </div>

      {/* Main content skeleton */}
      <div className="space-y-4">
        {/* Description */}
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>

        {/* Stream placeholder */}
        <Card>
          <CardContent className="aspect-video p-0">
            <Skeleton className="h-full w-full" />
          </CardContent>
        </Card>

        {/* Action button */}
        <Skeleton className="h-10 w-[200px]" />
      </div>
    </div>
  )
}
