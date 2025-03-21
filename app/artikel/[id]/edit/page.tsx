import { ArticleForm } from "@/components/articles/article-form";
import { getArticle } from "@/actions/article-actions";
import { currentUser } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";

interface EditArticlePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditArticlePage(props: EditArticlePageProps) {
  const resolvedParams = await props.params;
  
  const [article, user] = await Promise.all([
    getArticle(parseInt(resolvedParams.id)),
    currentUser()
  ]);

  if (!article) {
    notFound();
  }

  if (!user || user.role !== 'GURU' || user.id !== article.author.id) {
    redirect('/');
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Edit Article</h1>
      <ArticleForm initialData={article} />
    </div>
  );
}
