'use client'

import { Article } from "@/app/actions/article-actions"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { ImageIcon } from "lucide-react"

interface ArticleListProps {
  initialArticles: Article[]
  isGuru?: boolean
  isLoading?: boolean
  withScroll?: boolean
  className?: string
}

export function ArticleList({ 
  initialArticles, 
  isGuru = false,
  isLoading = false,
  withScroll = false,
  className = ""
}: ArticleListProps) {
  const content = (
    <div className="space-y-4">
      {isLoading ? (
        Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="space-y-2 flex-1 min-w-0">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-1/4 mt-2" />
            </div>
            <Skeleton className="h-16 w-16 sm:h-20 sm:w-20 rounded-md shrink-0" />
          </div>
        ))
      ) : initialArticles.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Tidak ada artikel.</p>
        </div>
      ) : (
        initialArticles.map((article) => (
          <Link key={article.id} href={`/artikel/${article.id}`} className="block">
            <div className="flex items-start gap-3 rounded-lg border p-2 transition-all duration-200 hover:bg-muted/50 hover:shadow-sm">
              <Avatar className="mt-1 border shrink-0 h-10 w-10">
                <AvatarImage src={article.author.image ?? ""} alt={article.author.name ?? "Author"} />
                <AvatarFallback>{article.author.name?.[0] ?? "U"}</AvatarFallback>
              </Avatar>
              <div className="space-y-1 flex-1 min-w-0">
                <p className="text-base sm:text-lg font-medium leading-tight line-clamp-2">{article.title}</p>
                <p className="text-sm text-muted-foreground line-clamp-2 hidden sm:block">
                  {article.description || "No description"}
                </p>
                <div className="flex items-center gap-2 pt-1 sm:pt-2">
                  <span className="text-xs font-medium text-muted-foreground truncate max-w-[100px] sm:max-w-none">
                    {article.author.name ?? "Anonymous"}
                  </span>
                  <span className="text-xs text-muted-foreground/60">•</span>
                  <time className="text-xs text-muted-foreground/60 truncate">
                    {formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })}
                  </time>
                </div>
              </div>
              <div className="shrink-0 rounded-md border bg-muted/30 w-16 h-16 sm:w-20 sm:h-20 overflow-hidden">
                {article.firstImageUrl ? (
                  <Image
                    src={article.firstImageUrl}
                    alt=""
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="text-muted-foreground/50" />
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  )

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        
        {isGuru && (
          <Link href="/artikel/create">
            <Button>Buat Artikel</Button>
          </Link>
        )}
      </div>

      {withScroll ? (
        <ScrollArea className="h-[610px] pr-4 -mr-4">
          {content}
        </ScrollArea>
      ) : content}
    </div>
  )
}
