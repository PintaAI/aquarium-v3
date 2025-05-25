import { getArticle } from "@/app/actions/article-actions"
import { currentUser } from "@/lib/auth"
import { ArticleView } from "@/components/articles/article-view"
import { notFound } from "next/navigation"
import { Metadata } from 'next'

interface ArticlePageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata(
  props: ArticlePageProps
): Promise<Metadata> {
  const params = await props.params;
  const article = await getArticle(parseInt(params.id))
  
  if (!article) {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found',
    }
  }

  const truncatedDescription = article.description?.substring(0, 160) || article.title // Use description or fallback to title

  return {
    title: `${article.title} - Aquarium`,
    description: truncatedDescription,
    openGraph: {
      title: article.title,
      description: truncatedDescription,
      type: 'article',
      publishedTime: article.createdAt.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: article.author.name ? [article.author.name] : undefined,
      locale: 'id_ID',
    },
  }
}

export default async function ArticlePage(props: ArticlePageProps) {
  const params = await props.params;
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
