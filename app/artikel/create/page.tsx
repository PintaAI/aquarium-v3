import { ArticleForm } from "@/components/articles/article-form"
import { currentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function CreateArticlePage() {
  const user = await currentUser();
  
  if (!user || user.role !== 'GURU') {
    redirect('/');
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Create New Article</h1>
      <ArticleForm />
    </div>
  );
}
