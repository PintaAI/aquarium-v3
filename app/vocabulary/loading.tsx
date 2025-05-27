import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        {/* Search Dialog Placeholder */}
        <div className="flex-1 max-w-sm">
          <Skeleton className="h-10 w-full" />
        </div>
        {/* Create Button Placeholder */}
        <Button disabled variant="outline" className="h-10">
          <Skeleton className="h-4 w-24" />
        </Button>
      </div>

      {/* Vocabulary Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="group relative bg-card overflow-hidden rounded-lg border border-border">
            <div className="relative h-32 w-full overflow-hidden">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-primary/20 to-emerald-500/20">
                {/* Decorative Orbs */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
                <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-emerald-500/20 rounded-full blur-2xl" />
              </div>
              
              {/* Top Row: Word Count and Privacy */}
              <div className="absolute top-2 inset-x-2 flex justify-between items-center">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>

              {/* Bottom Row: Author */}
              <div className="absolute bottom-2 left-2">
                <Skeleton className="h-6 w-32 rounded-full" />
              </div>
            </div>

            <div className="p-4">
              <div>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3 mt-1" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
