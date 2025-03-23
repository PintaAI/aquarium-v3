import { ArticleList } from "@/components/articles/article-list"
import { getArticles } from "@/app/actions/article-actions"
import { currentUser } from "@/lib/auth"

export default async function ArtikelPage() {
  const [articles, user] = await Promise.all([
    getArticles(),
    currentUser()
  ])

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <ArticleList 
        initialArticles={articles}
        isGuru={user?.role === 'GURU'} 
      />
    </div>
  )
}
