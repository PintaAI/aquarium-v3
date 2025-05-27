"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Article, deleteArticle } from "@/app/actions/article-actions";

interface ArticleViewProps {
  article: Article;
  isAuthor: boolean;
}

export function ArticleView({ article, isAuthor }: ArticleViewProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this article?')) {
      try {
        const result = await deleteArticle(article.id);
        if (result.success) {
          router.push('/artikel');
        } else {
          alert('Failed to delete article: ' + result.error);
        }
      } catch (error) {
        console.error('Failed to delete article:', error);
        alert('Failed to delete article. Please try again.');
      }
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-4xl mx-auto">
        <Card className="w-full p-0 md:p-6">
          <CardHeader className="space-y-2 md:space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={article.author?.image || undefined} alt={article.author?.name || 'Author'} />
                  <AvatarFallback>{article.author?.name?.[0] || 'A'}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl md:text-3xl font-bold">{article.title}</CardTitle>
                  <CardDescription>
                    By {article.author?.name || 'Unknown'} • {new Date(article.createdAt).toLocaleDateString()}
                  </CardDescription>
                </div>
              </div>
              {isAuthor && (
                <div className="flex space-x-2">
                  <Link href={`/artikel/${article.id}/edit`} passHref>
                    <Button variant="outline" className="text-sm md:text-base">
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                  </Link>
                  <Button variant="destructive" onClick={handleDelete} className="text-sm md:text-base">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <Separator className="my-4" />

          {article.description && (
            <CardContent className="py-4">
              <p className="text-lg text-muted-foreground">
                {article.description}
              </p>
            </CardContent>
          )}

          <CardContent>
            <div 
              className="prose max-w-none dark:prose-invert break-words text-sm md:text-base"
              dangerouslySetInnerHTML={{ __html: article.htmlDescription }} 
            />
          </CardContent>

          <Separator className="my-4" />
          
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date(article.updatedAt).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
