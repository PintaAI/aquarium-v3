"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { VocabularyCard } from "@/components/card/vocabulary-card"
import { ChevronRight, Plus } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

import { RecentVocabulary, getRecentVocabulary } from "@/lib/recent-vocabulary"

export function VocabularyCollection() {
  const [recentVocabulary, setRecentVocabulary] = useState<RecentVocabulary[]>([])

  useEffect(() => {
    setRecentVocabulary(getRecentVocabulary())
  }, [])

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">Kosa Kata Terakhir</CardTitle>
          <Link
            href="/vocabulary"
            className="text-sm font-medium text-muted-foreground hover:text-primary/80 transition-colors flex items-center"
          >
            View all
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[230px] lg:h-[580px] w-full rounded-md pr-4">
          <div className="space-y-3">
            {recentVocabulary.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[210px] text-center space-y-4 bg-muted-foreground/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Anda belum mengakses kosa kata apa pun.</p>
                <Link
                  href="/vocabulary/create"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Buat Koleksi
                </Link>
              </div>
            ) : (
              recentVocabulary.map((vocabulary) => (
                <Link key={vocabulary.id} href={`/vocabulary/${vocabulary.id}`} className="block">
                  <VocabularyCard
                    title={vocabulary.title}
                    description={vocabulary.description}
                    user={vocabulary.user}
                    items={vocabulary.items}
                    isPublic={vocabulary.isPublic}
                  />
                </Link>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
