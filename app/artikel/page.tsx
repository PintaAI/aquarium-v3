import { ArticleList } from "@/components/articles/article-list"
import { getArticles } from "@/app/actions/article-actions"
import { currentUser } from "@/lib/auth"
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Artikel - Aquarium',
  description: 'Kumpulan artikel pembelajaran bahasa Korea',
  openGraph: {
    title: 'Artikel - Aquarium',
    description: 'Kumpulan artikel pembelajaran bahasa Korea',
    type: 'website',
    locale: 'id_ID',
  },
}

export const revalidate = 3600 // Revalidate every hour

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
