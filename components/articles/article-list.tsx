'use client'

import { Article } from "@/actions/article-actions"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArticleCard } from "./article-card"

interface ArticleListProps {
  initialArticles: Article[]
  isGuru: boolean
}

export function ArticleList({ initialArticles, isGuru }: ArticleListProps) {
  return (
    <div className="space-y-6">
      {isGuru && (
        <div className="flex justify-end">
          <Link href="/artikel/create">
            <Button>Buat Artikel</Button>
          </Link>
        </div>
      )}

      {initialArticles.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Tidak ada artikel.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {initialArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              isAuthor={isGuru}
            />
          ))}
        </div>
      )}
    </div>
  )
}
