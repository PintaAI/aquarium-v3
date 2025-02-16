"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Search } from "lucide-react"

export default function Loading() {
  return (
    <div className="container mx-auto p-0 space-y-8">
      {/* Header Section */}
      <header className="text-center space-y-4">
        <Skeleton className="h-12 w-72 mx-auto" />
        <Skeleton className="h-16 max-w-2xl mx-auto" />
      </header>

      {/* Search Section */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/80 w-4 h-4"
          />
          <Skeleton className="w-full h-10 rounded-lg" />
        </div>
      </div>

      {/* Games Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="aspect-video relative">
              <Skeleton className="absolute inset-0" />
            </div>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-16" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}
