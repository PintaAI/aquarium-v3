import { ArticleList } from "@/components/articles/article-list"
import { getArticles } from "@/actions/article-actions"
import { currentUser } from "@/lib/auth"

export default async function ArtikelPage() {
  const [articles, user] = await Promise.all([
    getArticles(),
    currentUser()
  ])

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Articles</h1>
      <ArticleList 
        initialArticles={articles}
        isGuru={user?.role === 'GURU'} 
      />
    </div>
  )
}
