import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserIcon, TrashIcon, BookOpenIcon } from "lucide-react";
import { Article } from "@/app/actions/article-actions";

interface ArticleCardProps {
  article: Article;
  isAuthor: boolean;
  onDelete?: () => void;
}

const truncateText = (text: string, maxLength: number = 100) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
};

export function ArticleCard({ article, isAuthor, onDelete }: ArticleCardProps) {
  return (
    <Link href={`/artikel/${article.id}`}>
      <Card className="group relative bg-card overflow-hidden rounded-lg border border-border transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/50 hover:-translate-y-1">
        <div className="relative h-32 w-full overflow-hidden">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-primary/20 to-emerald-500/20">
            {/* Decorative Orbs */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-14 h-14 bg-emerald-500/20 rounded-full blur-2xl" />
          </div>

          {isAuthor && onDelete && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Author Info */}
          <div className="absolute bottom-2 left-2 flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/50 backdrop-blur-sm">
              {article.author.image ? (
                <Image
                  src={article.author.image}
                  alt={article.author.name || 'Unknown'}
                  width={16}
                  height={16}
                  className="rounded-full"
                />
              ) : (
                <UserIcon className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-xs font-medium text-foreground">
                {article.author.name || "Anonymous"}
              </span>
            </div>
          </div>
        </div>

        <CardContent className="p-4">
          <div>
            <CardTitle className="text-lg font-bold mb-1.5 line-clamp-1 group-hover:text-primary transition-colors">
              {article.title}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground line-clamp-2">
              {truncateText(article.description || 'Tidak ada deskripsi', 100)}
            </CardDescription>
          </div>
          <div className="mt-2">
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
              <BookOpenIcon className="h-3 w-3 mr-1 inline-block" aria-hidden="true" />
              Artikel
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
