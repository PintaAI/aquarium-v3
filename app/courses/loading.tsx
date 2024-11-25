import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search and filters container */}
      <div className="bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-2 border border-border mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="relative w-full lg:w-96">
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <Skeleton className="h-10 w-44" />
            <Skeleton className="h-10 w-44" />
          </div>
        </div>
      </div>

      {/* Course grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Add New Course Card */}
        <div className="bg-secondary border-dashed border-2 border-primary/20 rounded-lg">
          <div className="flex flex-col h-full items-center justify-center text-center p-8">
            <Skeleton className="w-16 h-16 rounded-full mb-4" />
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>

        {/* Course Cards */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="relative h-32 w-full">
              <Skeleton className="h-full w-full" />
              <div className="absolute top-2 left-2">
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
            </div>
            <div className="p-4">
              <Skeleton className="h-6 w-3/4 mb-1.5" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
