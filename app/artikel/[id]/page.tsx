import { getArticle } from "@/actions/article-actions"
import { currentUser } from "@/lib/auth"
import { ArticleView } from "@/components/articles/article-view"
import { notFound } from "next/navigation"

interface ArticlePageProps {
  params: {
    id: string
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticle(parseInt(params.id))

  if (!article) {
    notFound()
  }

  // Make user check optional
  let isAuthor = false
  try {
    const user = await currentUser()
    isAuthor = user?.id === article.author.id && user?.role === 'GURU'
  } catch (error) {
    // If there's an error getting the user, they're not authenticated
    // which is fine for viewing articles
    console.error('Error checking user:', error)
  }

  return <ArticleView article={article} isAuthor={isAuthor} />
}
