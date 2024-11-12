'use client'

import { Article } from "@/actions/article-actions"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

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
            <Button>Create Article</Button>
          </Link>
        </div>
      )}

      {initialArticles.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No articles found.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {initialArticles.map((article) => (
            <Link key={article.id} href={`/artikel/${article.id}`}>
              <Card className="p-4 h-full hover:shadow-lg transition-shadow">
                <h3 className="font-semibold mb-2">{article.title}</h3>
                {article.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {article.description}
                  </p>
                )}
                <div className="flex items-center text-sm text-muted-foreground mt-auto">
                  {article.author.image && (
                    <img
                      src={article.author.image}
                      alt={article.author.name || "Author"}
                      className="w-6 h-6 rounded-full mr-2"
                    />
                  )}
                  <span>{article.author.name}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
