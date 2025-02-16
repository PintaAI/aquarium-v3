import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getArticles, type Article } from "@/actions/article-actions";

export async function LatestArticles() {
  const articles = await getArticles();
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <Card className="border-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-md">Latest Articles</CardTitle>
          <a href="/artikel" className="text-xs font-medium hover:underline">
            See more
          </a>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] w-full rounded-md">
          <div className="space-y-4">
            {articles.map((article) => (
              <a
                key={article.id}
                href={`/artikel/${article.id}`}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium line-clamp-1">{article.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(article.createdAt)}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {article.author.name}
                </div>
              </a>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
