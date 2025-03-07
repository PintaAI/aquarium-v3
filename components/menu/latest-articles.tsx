"use client"

import type { Article } from "@/app/actions/article-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArticleList } from "@/components/articles/article-list"

interface LatestArticlesProps {
  articles: Article[]
  isLoading?: boolean
}

export function LatestArticles({ articles, isLoading = false }: LatestArticlesProps) {
  return (
    <Card className="col-span-3 border-none ">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-xl sm:text-lg">Artikel terbaru</CardTitle>
            <CardDescription className="text-sm">Recently published articles</CardDescription>
          </div>
          <Link href="/artikel">
            <Badge variant="outline" className="rounded-lg text-muted-foreground text-xs sm:text-sm">
              View All
            </Badge>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        <ArticleList
          initialArticles={articles}
          isLoading={isLoading}
          withScroll={true}
        />
      </CardContent>
    </Card>
  )
}
